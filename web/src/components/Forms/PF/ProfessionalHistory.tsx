import React from 'react'

import * as yup from "yup";
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { yupLocale } from '../../../utilities/misc';

import {
    FormControlLabel,
    Grid,
    Switch,
    TextField,
    Typography,
    CircularProgress,
    Backdrop,
    makeStyles,
    createStyles,
    IconButton
} from '@material-ui/core';
import Button from '@material-ui/core/Button';

import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';

import { KeyboardDatePicker, KeyboardDatePickerProps } from '@material-ui/pickers';

import { PfProfessionalHistory, usePFaddProfessionalHistoryMutation, usePFremoveProfessionalHistoryMutation, usePFupdateProfessionalHistoryMutation } from '../../../graphql/generated';

import { useSnackbar } from 'notistack';

import Cleave from 'cleave.js/react';

import axios from 'axios';
import moment from 'moment';
import Autocomplete from '@material-ui/lab/Autocomplete';


const validationSchema = yup.object().shape({
    EPI: yup.boolean().required(yupLocale.required),
    office: yup.string()
        .max(40, yupLocale.string.messages.max)
        .required(yupLocale.required),
    CBO: yup.string()
        .min(4, yupLocale.string.messages.min)
        .max(6, yupLocale.string.messages.max)
        .matches(/^[^\W_]{4,6}$/, yupLocale.string.messages.CEP)
        .required(yupLocale.required),
    admissionDate: yup.date()
        .required(yupLocale.required),
    startDate: yup.date(),
    recisionDate: yup.date(),
        
});

const useStyles = makeStyles(
    theme => createStyles({
        root: {
            width: '100%',
            padding: theme.spacing(2)
        },
        option: {
            fontSize: 15,
            '& > span': {
                marginRight: 10,
                fontSize: 18,
            },
        },
        button: {
            color: theme.palette.common.white,
            margin: theme.spacing(1)
        },
        actionRow: {
            padding: theme.spacing(2)
        },
        invertedIcon: {
            transform: "rotate(-180deg)"
        }
    })
);

const DatePickerField = (props: KeyboardDatePickerProps) => {
    return <KeyboardDatePicker {...props} autoOk
        invalidDateMessage="Data Inválida"
        maxDateMessage={props.maxDateMessage ? props.maxDateMessage : "Não é uma Data Valida"}
        minDateMessage={props.minDateMessage ? props.minDateMessage : "Não é uma Data Valida"}
        variant="inline"
        inputVariant="outlined"
        format="DD/MM/yyyy"
        InputAdornmentProps={{ position: "end" }}
        value={props.value}
        onChange={props.onChange}/>
}

const StartDateField = (
    props: KeyboardDatePickerProps & {control: any, initialData?: Partial<PfProfessionalHistory>}
) => {
    let admissionDate = useWatch({
        control: props.control,
        name: "admissionDate",
        defaultValue: props.initialData ? props.initialData.admissionDate : null
    })

    return <DatePickerField {...props} minDate={admissionDate}/>;
}

const RecisionDateField = (
    props: KeyboardDatePickerProps & {control: any, initialData?: Partial<PfProfessionalHistory>}
) => {
    let startDate = useWatch({
        control: props.control,
        name: "startDate",
        defaultValue: props.initialData ? props.initialData.startDate : null
    })

    return <DatePickerField {...props} minDate={startDate}/>;
}

const CleaveTextField = ({ inputRef, options, ...otherProps }: any) => (
    <Cleave {...otherProps} htmlRef={inputRef} options={options} />
);

/* function CompanySelect({ initialData, error, helperText, inputRef }:
    { initialData?: Partial<PfProfessionalHistory>, error: boolean, helperText?: string, inputRef: any }) {
    const classes = useStyles();

    return (
        <Autocomplete
            options={countryCodes.map(value => value.code) as string[]}
            defaultValue={defaultValue}
            classes={{
                option: classes.option,
            }}
            autoHighlight
            renderOption={(option) => (
                <React.Fragment>
                    <span>{countryToFlag(option)}</span>
                    {option}
                </React.Fragment>
            )}
            renderInput={(params) => (
                <TextField variant="outlined"
                    {...params}
                    name="country"
                    label="Pais"
                    error={error}
                    helperText={helperText}
                    inputRef={inputRef}
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password', // Disable AutoComplete and AutoFill
                        maxLength: 2
                    }}
                />
            )}
        />
    );
} */


export interface ProfessionalHistoryFormProps {
    initialData?: Partial<PfProfessionalHistory>;
    PFCustomerID: string;
}

export const ProfessionalHistoryForm: React.FC<ProfessionalHistoryFormProps> = (
    { initialData, PFCustomerID }
) => {

    const [loading, setLoading] = React.useState(false)

    // Hooks
    const { handleSubmit, errors, control } = useForm({ resolver: yupResolver(validationSchema) });
    const { enqueueSnackbar } = useSnackbar();
    
    const [addProfessionalHistory] = usePFaddProfessionalHistoryMutation();
    const [updateProfessionalHistory] = usePFupdateProfessionalHistoryMutation();
    const [removeProfessionalHistory] = usePFremoveProfessionalHistoryMutation();

    const handleAddUpdate = async (data: any) => {
        try {
            setLoading(true)
            if (initialData && initialData.id) {
                let updateResponse = await updateProfessionalHistory({variables: {
                    PFProfessionalHistoryID: initialData.id,
                    ...data
                }});
                
                if (updateResponse.data) enqueueSnackbar("Endereço Alterado com Sucesso !", {variant: "success"});

            } else {
                let addResponse = await addProfessionalHistory({variables: {
                    PFCustomerID: PFCustomerID,
                    ...data
                }});
                
                if (addResponse.data) enqueueSnackbar("Novo Endereço Adicionado com Sucesso !", {variant: "success"});
            }
        } catch (err) {
            console.error(err);
            setLoading(false)
            if (initialData) {
                enqueueSnackbar("Erro ao Atualizar Endereço. Tente Novamente em Alguns Minutos.", {variant: "error"});
            } else {
                enqueueSnackbar("Erro ao Adicionar Endereços. Tente Novamente em Alguns Minutos.", {variant: "error"});
            }
        }
    }

    const handleRemove = async () => {
        try {
            if (initialData && initialData.id) {
                setLoading(true)
            
                let removeResponse = await removeProfessionalHistory({variables: {
                    PFProfessionalHistoryIDS: [initialData.id],
                }});
                
                if (removeResponse.data) enqueueSnackbar("Endereço Removido com Sucesso !", {variant: "success"});
            } else {
                throw new Error("ID Not Found");
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            enqueueSnackbar("Erro ao Remover Endereço. Tente Novamente em Alguns Minutos.", {variant: "error"})   
        }
    }

    // CSS
    const classes = useStyles();

    return (
        <form id="PFProfessionalHistory" className={classes.root} onSubmit={handleSubmit((data) => handleAddUpdate(data))} autoComplete="false">
            <Grid container direction='column' spacing={3}>
                
                <Grid item container direction='row-reverse' >
                    <Grid item>
                        <Controller
                            name="EPI"
                            control={control}
                            defaultValue={(initialData && initialData.EPI) ? initialData.EPI : false}
                            render={props =>
                                <FormControlLabel label="Uso de EPI" labelPlacement='start'
                                    control={
                                        <Switch color="primary" checked={props.value} size='small'
                                            onChange={e => props.onChange(e.target.checked)} />
                                    }
                                />
                            }
                        />
                    </Grid>
                </Grid>

                <Grid item container direction='row' spacing={3}>
                    <Grid item lg={2}>
                        <Controller 
                            defaultValue={(initialData && initialData.CBO) ? initialData.CBO : ""}
                            name="CBO"
                            control={control}
                            label="CBO"
                            as={
                                <TextField fullWidth variant="outlined"
                                    error={!!errors.CBO}
                                    helperText={errors.CBO ? errors.CBO.message : ""}
                                    inputProps={{
                                        maxLength: 6
                                    }}/>
                                }/>
                    </Grid>
                    <Grid item lg={1}><IconButton><DoubleArrowIcon className={classes.invertedIcon}/></IconButton></Grid>
                    <Grid item lg={1}><IconButton><DoubleArrowIcon/></IconButton></Grid>
                    <Grid item lg={4}>
                        <Controller 
                            defaultValue={(initialData && initialData.office) ? initialData.office : ""}
                            name='office'
                            control={control}
                            label="Cargo"
                            as={
                                <TextField fullWidth variant="outlined"
                                    error={!!errors.office}
                                    helperText={errors.office ? errors.office.message : ""}
                                    inputProps={{
                                        maxLength: 40
                                    }}/>
                                }/>
                        
                    </Grid>

                    <Grid item lg={4}>
                        <Controller 
                            defaultValue={(initialData && initialData.company) ?
                                    initialData.company : null}
                            name='company'
                            control={control}
                            label="Empresa"
                            as={
                                <TextField fullWidth select variant="outlined"
                                    error={!!errors.company}
                                    helperText={errors.company ? errors.company.message : ""}
                                    inputProps={{
                                        maxLength: 40
                                    }}/>
                                }/>
                        
                    </Grid>

                </Grid>

                <Grid item container direction='row' spacing={3}>
                    <Grid item lg={4}>
                        <Controller 
                            defaultValue={(initialData && initialData.admissionDate) ?
                                moment.utc(new Date(initialData.admissionDate)).format('DD/MM/yyyy') : null}                            
                            name='admissionDate'
                            control={control}
                            label="Data de Admissão"
                            render={props => <DatePickerField label="Data de Admissão" value={props.value} onChange={props.onChange}/>} />
                    </Grid>
                    <Grid item lg={4}>
                        <Controller 
                            defaultValue={(initialData && initialData.startDate) ?
                                moment.utc(new Date(initialData.startDate)).format('yyyy-MM-DD') : null}                            
                            name='startDate'
                            control={control}
                            label="Data de Início"
                            render={props => <StartDateField control={control} initialData={initialData}
                                label="Data de Início" value={props.value} onChange={props.onChange}/>
                                } />
                    </Grid>
                    <Grid item lg={4}>
                        <Controller 
                            defaultValue={(initialData && initialData.recisionDate) ?
                                moment.utc(new Date(initialData.recisionDate)).format('yyyy-MM-DD') : null}                            
                            name='recisionDate'
                            control={control}
                            label="Data de Recisão"
                            render={props => <RecisionDateField control={control} initialData={initialData}
                                label="Data de Recisão" value={props.value} onChange={props.onChange}/>
                                } />
                    </Grid>
                </Grid>

                <Grid item container direction='row-reverse' spacing={3} className={classes.actionRow}>
                    <Button variant="contained" color="primary" className={classes.button} type="submit">Salvar</Button>
                    {initialData && <Button variant="contained" color="primary" className={classes.button} onClick={handleRemove}>Excluir</Button>}
                </Grid>

                {loading && 
                    <Grid item><Backdrop open={true} style={{zIndex: 10}}>
                        <CircularProgress size={75} color='secondary'/> 
                    </Backdrop></Grid>}

            </Grid>
        </form>
    );
}