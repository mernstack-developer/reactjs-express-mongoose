import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { 
  fetchCart, 
  removeFromCart, 
  clearCart, 
  clearCartError 
} from '../features/cart/cartSlice';
const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: cart, loading, error } = useAppSelector((state) => state.cart);
  const { data: user } = useAppSelector((state) => state.user);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchCart());
    }
  }, [dispatch, user?._id]);

  const handleRemoveItem = async (itemId: string) => {
    setIsRemoving(itemId);
    try {
      await dispatch(removeFromCart(itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await dispatch(clearCart());
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const handleCheckout = () => {
    if (!cart?.items || cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/public-courses');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <span className="text-4xl mr-3">🛒</span>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          <button
            onClick={handleContinueShopping}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => dispatch(clearCartError())}
              className="ml-2 text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {cart?.items && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Items in your cart ({cart.items.length})
                  </h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item: any, index: number) => (
                    <div key={index} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Course Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.course.imageUrl || item.course.thumbnail || '/api/placeholder/400/300'}
                            alt={item.course.title}
                            className="h-24 w-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = '/api/placeholder/400/300';
                            }}
                          />
                        </div>

                        {/* Course Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
                                onClick={() => navigate(`/course/${item.course._id}`)}>
                                {item.course.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.course.category?.name || 'Uncategorized'}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Instructor: {item.course.instructor || 'TBA'}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(item.price)}
                              </p>
                              <button
                                onClick={() => handleRemoveItem(item._id)}
                                disabled={isRemoving === item._id}
                                className="mt-2 text-red-600 hover:text-red-800 flex items-center space-x-1"
                              >
                                🗑️
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                          
                          {/* Course Description Preview */}
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {item.course.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Clear Cart
                    </button>
                    <div className="text-sm text-gray-600">
                      {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(cart?.subtotal || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">{formatCurrency(cart?.tax || 0)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(cart?.total || 0)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    💳
                    <span>Proceed to Checkout</span>
                  </button>
                </div>
              </div>

              {/* Security Info */}
              <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Secure Checkout</h3>
                <p className="text-xs text-gray-600">
                  Your payment is encrypted and secure. We never store your credit card information.
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="h-1 w-3 bg-blue-600 rounded"></div>
                    <div className="h-1 w-3 bg-green-600 rounded"></div>
                    <div className="h-1 w-3 bg-yellow-600 rounded"></div>
                    <div className="h-1 w-3 bg-red-600 rounded"></div>
                  </div>
                  <span className="text-xs text-gray-600">SSL Secured</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart */
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 rounded-full p-6">
                <span className="text-6xl text-gray-400">🛒</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some amazing courses to get started!</p>
            <button
              onClick={handleContinueShopping}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;