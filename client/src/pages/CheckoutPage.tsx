import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { createPaymentIntent } from '../features/cart/cartSlice';

const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: cart } = useAppSelector((state) => state.cart);
  const { data: user } = useAppSelector((state) => state.user);
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [billingInfo, setBillingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate('/cart');
    }
    
    // Pre-fill billing info from user
    if (user) {
      setBillingInfo(prev => ({
        ...prev,
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        phone: user.phone || ''
      }));
    }
  }, [cart, user, navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cart) {
      alert('Cart is empty');
      return;
    }

    // Validate billing info
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (const field of requiredFields) {
      if (!billingInfo[field as keyof typeof billingInfo]) {
        alert(`Please fill in ${field}`);
        return;
      }
    }

    setLoading(true);

    try {
      // Create payment intent
      const result = await dispatch(createPaymentIntent({
        cartId: cart._id,
        paymentMethod
      }));

      if (result.meta?.requestStatus === 'rejected') {
        throw new Error('Failed to create payment intent');
      }

      const paymentData = result.payload;
      
      // Initialize Razorpay payment
      const options = {
        key: paymentData.keyId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'E-Learning Platform',
        description: `${cart.items.length} course(s)`,
        image: '/favicon.ico',
        order_id: paymentData.orderId,
        handler: async function(response: any) {
          console.log('Payment successful response:', response);
          // Payment successful
          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              alert('Payment successful! You have been enrolled in the courses.');
              navigate('/user/courses');
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: billingInfo.name,
          email: billingInfo.email,
          contact: billingInfo.phone
        },
        notes: {
          address: `${billingInfo.address}, ${billingInfo.city}, ${billingInfo.state}, ${billingInfo.zipCode}, ${billingInfo.country}`
        },
        theme: {
          color: '#3b82f6'
        }
      };

      try {
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        
        rzp.on('payment.failed', function(response: any) {
          console.error('Razorpay payment failed:', response);
          alert('Payment failed. Please try again.');
        });
        
        rzp.on('payment.cancelled', function(response: any) {
          console.log('Razorpay payment cancelled:', response);
          alert('Payment was cancelled.');
        });
        
        rzp.open();
      } catch (error) {
        console.error('Error initializing Razorpay:', error);
        alert('Failed to initialize payment gateway. Please try again.');
      }

    } catch (error) {
      console.error('Error creating payment intent:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Secure checkout</span>
            <div className="flex space-x-1">
              <div className="h-1 w-2 bg-blue-600 rounded"></div>
              <div className="h-1 w-2 bg-green-600 rounded"></div>
              <div className="h-1 w-2 bg-yellow-600 rounded"></div>
              <div className="h-1 w-2 bg-red-600 rounded"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Billing Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing Information</h2>
            
            <form onSubmit={handlePayment}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={billingInfo.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={billingInfo.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={billingInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={billingInfo.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={billingInfo.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={billingInfo.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={billingInfo.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    name="country"
                    value={billingInfo.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.items.map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-3">
                  <img
                    src={item.course.imageUrl || item.course.thumbnail || '/api/placeholder/100/100'}
                    alt={item.course.title}
                    className="h-12 w-12 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/100/100';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{item.course.title}</h3>
                    <p className="text-xs text-gray-600">{formatCurrency(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(cart?.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span>{formatCurrency(cart?.tax || 0)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(cart?.total || 0)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">Razorpay</span>
                <div className="ml-2 text-xs text-gray-500">Credit/Debit Cards, UPI, Net Banking</div>
              </label>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Pay ${formatCurrency(cart?.total || 0)}`
                )}
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              By clicking "Pay Now", you agree to our terms of service and privacy policy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;