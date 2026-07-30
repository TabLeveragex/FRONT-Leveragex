import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Stack,
    Typography,
    Paper,
    Checkbox
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../config/api";
import PaidIcon from '@mui/icons-material/Paid';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import "../styles/Congrats.css";

const ACCENT = "#10b981";
const ACCENT_HOVER = "#059669";
const BG_CARD = "#121b2a";
const BG_SECONDARY = "#0f1623";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_MUTED = "#94a3b8";
const DANGER = "#ef4444";

const fieldSx = {
    InputLabelProps: { style: { color: TEXT_MUTED } },
    InputProps: {
        style: { color: TEXT_PRIMARY },
        sx: {
            '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.35)' },
            '&:hover fieldset': { borderColor: ACCENT },
            '&.Mui-focused fieldset': { borderColor: ACCENT }
        }
    }
};

const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    pancard: Yup.string()
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN card format")
        .required("PAN card is required"),
    upiId: Yup.string()
        .matches(/^[\w.-]+@[\w.-]+$/, "Invalid UPI ID format")
        .required("UPI ID is required"),
});

const PayloadDialogForm = () => {
    const [open, setOpen] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const navigate = useNavigate();
    const { width, height } = useWindowSize();

    const formik = useFormik({
        initialValues: {
            name: "",
            pancard: "",
            upiId: "",
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            setSubmitted(true);
            try {
                await api.post('/congrats', {
                    Username: values.name,
                    Pancard: values.pancard,
                    UpiId: values.upiId,
                });

                setTimeout(() => {
                    resetForm();
                    setSubmitted(false);
                    setOpen(false);
                    navigate('/pnl');
                }, 5000);
            } catch (error) {
                console.error('Error submitting details:', error);
                setSubmitted(false);
            }
        },
    });

    const handleClose = () => {
        navigate('/pnl');
    };

    return (
        <div className="congrats-page withdrawal-page">
        <Dialog
            open={open}
            fullWidth
            maxWidth="sm"
            sx={{ '& .MuiDialog-container': { alignItems: 'center' } }}
            PaperProps={{
                sx: {
                    backgroundColor: submitted ? BG_SECONDARY : BG_CARD,
                    borderRadius: 3,
                    border: '1px solid rgba(148, 163, 184, 0.15)',
                    overflow: "hidden",
                },
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(2, 6, 12, 0.82)',
                },
            }}
        >
            {submitted ? (
                <Box className="congrats-success-wrap">
                    <Confetti width={width} height={height} numberOfPieces={200} recycle={false} />
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 120, damping: 10 }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                backgroundColor: BG_CARD,
                                border: `1px solid rgba(16, 185, 129, 0.35)`,
                                borderRadius: 2,
                                textAlign: "center",
                                color: TEXT_PRIMARY,
                                maxWidth: "400px",
                                mx: "auto",
                            }}
                        >
                            <Typography variant="h6" sx={{ color: ACCENT, fontWeight: 700, mb: 1 }}>
                                Withdrawal request accepted
                            </Typography>
                            <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
                                Your details have been successfully submitted.
                            </Typography>
                        </Paper>
                    </motion.div>
                </Box>
            ) : (
                <>
                    <DialogTitle
                        sx={{
                            backgroundColor: BG_SECONDARY,
                            color: TEXT_PRIMARY,
                            fontWeight: 700,
                            textAlign: "center",
                            borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
                        }}
                    >
                        <PaidIcon sx={{ fontSize: 23, color: ACCENT, mr: 0.7, verticalAlign: 'middle' }} />
                        Withdrawal Request
                    </DialogTitle>
                    <form onSubmit={formik.handleSubmit}>
                        <Box sx={{ backgroundColor: BG_CARD, p: 3 }}>
                            <DialogContent>
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="Name"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                    {...fieldSx}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="PAN Card"
                                    name="pancard"
                                    value={formik.values.pancard}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.pancard && Boolean(formik.errors.pancard)}
                                    helperText={formik.touched.pancard && formik.errors.pancard}
                                    {...fieldSx}
                                />
                                <TextField
                                    fullWidth
                                    margin="normal"
                                    label="UPI ID"
                                    name="upiId"
                                    value={formik.values.upiId}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.upiId && Boolean(formik.errors.upiId)}
                                    helperText={formik.touched.upiId && formik.errors.upiId}
                                    {...fieldSx}
                                />
                                <Stack direction="row" alignItems="center" onClick={() => setIsDisabled(!isDisabled)} sx={{ mt: 1 }}>
                                    <Checkbox checked={isDisabled} sx={{ color: ACCENT, '&.Mui-checked': { color: ACCENT } }} />
                                    <Typography variant="body2" sx={{ color: TEXT_MUTED }}>
                                        I agree to the <a href="/term" style={{ color: ACCENT }}>Terms and Conditions</a>
                                    </Typography>
                                </Stack>
                            </DialogContent>
                            <DialogActions sx={{ px: 3, pb: 2 }}>
                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: DANGER, "&:hover": { backgroundColor: "#dc2626" } }}
                                    onClick={handleClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ background: `linear-gradient(135deg, ${ACCENT}, #06b6d4)`, color: '#041016', "&:hover": { opacity: 0.92 } }}
                                    disabled={!isDisabled}
                                >
                                    Submit
                                </Button>
                            </DialogActions>
                        </Box>
                    </form>
                </>
            )}
        </Dialog>
        </div>
    );
};

export default PayloadDialogForm;
