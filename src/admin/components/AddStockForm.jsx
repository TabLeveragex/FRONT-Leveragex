import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Paper, Typography, Stack, TextField, Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { handleError, handleSuccess } from '../../utils';
import { useAddStock } from '../hooks/useAdminQueries';

const schema = Yup.object({
  name: Yup.string().trim().required('Stock name is required'),
  price: Yup.number().typeError('Enter a valid price').required('Price is required'),
  watchlist1_A: Yup.number().typeError('Enter a valid A value').required('A is required'),
  watchlist1_B: Yup.number().typeError('Enter a valid B value').required('B is required'),
});

function AddStockForm() {
  const addStock = useAddStock();

  const formik = useFormik({
    initialValues: {
      name: '',
      price: '',
      watchlist1_A: '',
      watchlist1_B: '',
    },
    validationSchema: schema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await addStock.mutateAsync({
          name: values.name.trim(),
          price: Number(values.price),
          watchlist1_A: Number(values.watchlist1_A),
          watchlist1_B: Number(values.watchlist1_B),
        });
        handleSuccess('Stock added to WatchList successfully!');
        resetForm();
      } catch (error) {
        handleError(error.response?.data?.message || 'Error adding stock');
      }
    },
  });

  return (
    <Paper sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add Stock
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Stocks cannot be deleted from this dashboard. Use unique names when adding.
      </Typography>
      <form onSubmit={formik.handleSubmit} noValidate>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
          <TextField
            label="Stock Name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            size="small"
            fullWidth
          />
          <TextField
            label="Price (₹)"
            name="price"
            type="number"
            value={formik.values.price}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.price && Boolean(formik.errors.price)}
            helperText={formik.touched.price && formik.errors.price}
            size="small"
            fullWidth
          />
          <TextField
            label="Watchlist A"
            name="watchlist1_A"
            type="number"
            value={formik.values.watchlist1_A}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.watchlist1_A && Boolean(formik.errors.watchlist1_A)}
            helperText={formik.touched.watchlist1_A && formik.errors.watchlist1_A}
            size="small"
            fullWidth
          />
          <TextField
            label="Watchlist B"
            name="watchlist1_B"
            type="number"
            value={formik.values.watchlist1_B}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.watchlist1_B && Boolean(formik.errors.watchlist1_B)}
            helperText={formik.touched.watchlist1_B && formik.errors.watchlist1_B}
            size="small"
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={addStock.isPending ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
            disabled={addStock.isPending}
            sx={{ minWidth: 160, height: 40, mt: { xs: 0, md: 0.5 } }}
          >
            {addStock.isPending ? 'Adding…' : 'Add Stock'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}

export default AddStockForm;
