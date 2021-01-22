import React from 'react';

import { PfDisability, PFfetchCustomerByIdQuery } from '../../../graphql/generated';

import { PFAddressForm, PFDisabilityForm } from '../../Forms';
import { createStyles, makeStyles } from '@material-ui/core/styles';

import Accordion from '@material-ui/core/Accordion';
import AccordionActions from '@material-ui/core/AccordionActions';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import Typography from '@material-ui/core/Typography';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import {PFgenerateDefaultName} from '../../../utilities/misc'


const useStyles = makeStyles(
    (theme) => createStyles({
        root: {
            
        },
        actionRow: {
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1)
        },
        button: {
            color: theme.palette.common.white
        },
        accordion: {
            border: `1px solid #efefef`,
            marginTop: theme.spacing(1)
        },
        accordionHeadingText: {
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        accordionSubHeadingText: {
            color: theme.palette.text.disabled,
        }
    })
)

interface DisabilityAccordionProps {
    disability?: Partial<PfDisability>;
    setNewDisabilityFormOpen?: React.Dispatch<React.SetStateAction<boolean>>;    
    PFCustomerID: string;
}

const DisabilityAccordion:React.FC<DisabilityAccordionProps> = (
    {disability, setNewDisabilityFormOpen, PFCustomerID}
) => {
    
    // State
    const [open, setOpen] = React.useState(disability ? false : true);

    // Methods
    const handleChange = () => {
        setOpen(!open);
        if (!disability && setNewDisabilityFormOpen) setTimeout(() => setNewDisabilityFormOpen(false), 500);
    }

    // CSS
    const classes = useStyles();
    
    if (disability) {
        return (
            <Accordion 
                className={classes.accordion}
                expanded={open}
                onChange={handleChange}
                elevation={4} 
                TransitionProps={{ unmountOnExit: true }}>  
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Grid container direction="row" alignContent="center" alignItems="center" spacing={3}>
                            <Grid item lg={8}>
                                <Typography className={classes.accordionHeadingText}>{disability.nomenclature}</Typography>
                            </Grid>
                            <Grid item>
                                <Grid container alignContent="center" alignItems="center" spacing={3}>
                                    <Grid item className={classes.accordionSubHeadingText}>
                                        {disability.CID}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </AccordionSummary>

                    <AccordionDetails>
                        <PFDisabilityForm initialData={disability} PFCustomerID={PFCustomerID}/>
                    </AccordionDetails>
            </Accordion>
            
        )
    } else {
        return (
            <Accordion 
                className={classes.accordion}
                expanded={open}
                onChange={handleChange}
                elevation={4} 
                TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography className={classes.accordionHeadingText}>Nova Deficiência</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <PFDisabilityForm initialData={disability} PFCustomerID={PFCustomerID}/>
                    </AccordionDetails>
            </Accordion>
        ); 
    }
}

export interface DisabilityTabProps {
    customer?: PFfetchCustomerByIdQuery;
}

export const DisabilityTab: React.FC<DisabilityTabProps> = ({customer}) => {
    
    // CSS
    const classes = useStyles();

    // State
    const [newDisabilityFormOpen, setNewDisabilityFormOpen] = React.useState(false)
    
    return (
        <Grid container direction='column'>
            <Grid item container direction='row-reverse' className={classes.actionRow}>
                <Button 
                    className={classes.button}
                    variant='contained'
                    color='primary'
                    onClick={() => setNewDisabilityFormOpen(true)}>
                        Adicionar Deficiência
                </Button>
            </Grid>
            <Grid item>
                {customer && newDisabilityFormOpen &&
                    <DisabilityAccordion 
                        setNewDisabilityFormOpen={setNewDisabilityFormOpen}
                        PFCustomerID={customer.PFfetchCustomerById.id}/>}
                {   customer && 
                    customer.PFfetchCustomerById.PFextraInfo.disabilities &&
                    customer.PFfetchCustomerById.PFextraInfo.disabilities.map(disability => 
                        <DisabilityAccordion 
                            key={disability.id}
                            disability={disability}
                            PFCustomerID={customer.PFfetchCustomerById.id}/>
                    ) 
                }
            </Grid>
        </Grid>
    );
}

export default DisabilityTab;