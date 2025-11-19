import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "../../utils/api";
import { ApiResponse, Cart } from "../../types/types";

interface CartState {
  data: Cart | null;
  loading: boolean;
  error: string | null;
  cartOpen: boolean;
}

const initialState: CartState = {
  data: null,
  loading: false,
  error: null,
  cartOpen: false,
};

// Async thunks
export const fetchCart = createAsyncThunk<Cart>('cart/fetchCart', async () => {
  const response = await apiClient.get<ApiResponse<Cart>>('/cart');
  if (!response.data) throw new Error('Failed to fetch cart');
  return response.data.data;
});

export const addToCart = createAsyncThunk<Cart, string>('cart/addToCart', async (courseId) => {
  const response = await apiClient.post<ApiResponse<Cart>>('/cart/add', { courseId });
  if (!response.data) throw new Error('Failed to add course to cart');
  return response.data.data;
});

export const removeFromCart = createAsyncThunk<Cart, string>('cart/removeFromCart', async (itemId) => {
  const response = await apiClient.delete<ApiResponse<Cart>>(`/cart/remove/${itemId}`);
  if (!response.data) throw new Error('Failed to remove item from cart');
  return response.data.data;
});

export const updateCartItem = createAsyncThunk<Cart, { itemId: string; quantity: number }>('cart/updateCartItem', async ({ itemId, quantity }) => {
  const response = await apiClient.put<ApiResponse<Cart>>(`/cart/update/${itemId}`, { quantity });
  if (!response.data) throw new Error('Failed to update cart item');
  return response.data.data;
});

export const clearCart = createAsyncThunk<Cart>('cart/clearCart', async () => {
  const response = await apiClient.delete<ApiResponse<Cart>>('/cart/clear');
  if (!response.data) throw new Error('Failed to clear cart');
  return response.data.data;
});

export const createPaymentIntent = createAsyncThunk<any, { cartId: string; paymentMethod: string }>('cart/createPaymentIntent', async ({ cartId, paymentMethod }) => {
  const response = await apiClient.post<ApiResponse<any>>('/payments/create-intent', { 
    cartId, 
    paymentMethod,
    successUrl: `${window.location.origin}/checkout/success`,
    cancelUrl: `${window.location.origin}/checkout/cancel`
  });
  if (!response.data) throw new Error('Failed to create payment intent');
  return response.data.data;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.cartOpen = action.payload;
    },
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch cart';
    });

    // Add to cart
    builder.addCase(addToCart.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(addToCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addToCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to add item to cart';
    });

    // Remove from cart
    builder.addCase(removeFromCart.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(removeFromCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(removeFromCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to remove item from cart';
    });

    // Update cart item
    builder.addCase(updateCartItem.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(updateCartItem.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateCartItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to update cart item';
    });

    // Clear cart
    builder.addCase(clearCart.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(clearCart.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(clearCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to clear cart';
    });

    // Create payment intent
    builder.addCase(createPaymentIntent.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createPaymentIntent.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(createPaymentIntent.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to create payment intent';
    });
  },
});

export const { setCartOpen, clearCartError } = cartSlice.actions;
export default cartSlice.reducer;