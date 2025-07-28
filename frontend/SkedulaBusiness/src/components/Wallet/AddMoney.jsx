import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

function AddMoney() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const createOrder = async () => {
    console.log("---- Creating order ----")
    
    if (!amount || !currency || !email) {
      alert("Please fill all fields")
      return null
    }

    try {
      const response = await fetch('http://localhost:8080/razorpay/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: currency,
          email: email
        })
      })
      
      console.log("Request sent to backend:")
      console.log(email)

      if (!response.ok) {
        console.error("Failed to create order:", response.status, response.statusText)
        alert("Failed to create order. Please try again.")
        return null
      }

      const order = await response.json()
      console.log("Order created:", order)
      return order
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Error creating order. Please try again.")
      return null
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await createOrder()
      console.log("Response from createOrder:", response)
      
      if (!response || !response.data || !response.data.razorpayOrderId) {
        console.error("Invalid response from backend")
        alert("Invalid response from backend")
        return
      }

      const options = {
        "key": "rzp_test_1osnPBeF2xSAFe",
        "amount": response.data.amount,
        "currency": response.data.currency,
        "name": "Skedula Pvt Ltd",
        "description": "Add to wallet",
        "order_id": response.data.razorpayOrderId,
        "handler": function (res) {
          alert("Payment successful! Payment ID: " + res.razorpay_payment_id)
          // Redirect back to wallet or close window
          if (window.opener) {
            window.opener.location.reload() // Refresh parent window
            window.close() // Close current window
          } else {
            window.location.href = '/wallet' // Redirect to wallet
          }
        },
        "modal": {
          "ondismiss": function() {
            console.log("Payment cancelled by user")
          }
        },
        "theme": {
          "color": "#3399cc"
        }
      }

      console.log("Starting Razorpay payment with:", options)
      
      // Load Razorpay script dynamically
      if (!window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => {
          const rzp = new window.Razorpay(options)
          rzp.open()
        }
        document.head.appendChild(script)
      } else {
        const rzp = new window.Razorpay(options)
        rzp.open()
      }
    } catch (error) {
      console.error("Error in payment process:", error)
      alert("Error in payment process. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-primary text-white text-center py-4">
                <h2 className="mb-0">
                  <i className="bi bi-wallet2 me-2"></i>
                  Add Money to Wallet
                </h2>
                <p className="mb-0 opacity-75">RazorPay Secure Payment</p>
              </div>
              
              <div className="card-body p-4">
                <form onSubmit={handlePayment}>
                  {/* Amount Field */}
                  <div className="mb-4">
                    <label htmlFor="amount" className="form-label fw-semibold">
                      <i className="bi bi-currency-rupee text-success me-2"></i>
                      Amount
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-success text-white">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-lg"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="1"
                        required
                      />
                    </div>
                    <small className="text-muted">Minimum amount: ₹1</small>
                  </div>

                  {/* Currency Field */}
                  <div className="mb-4">
                    <label htmlFor="currency" className="form-label fw-semibold">
                      <i className="bi bi-globe text-info me-2"></i>
                      Currency
                    </label>
                    <select
                      className="form-select form-select-lg"
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select currency</option>
                      <option value="INR">INR - Indian Rupee</option>
                    </select>
                  </div>

                  {/* Email Field */}
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold">
                      <i className="bi bi-envelope text-warning me-2"></i>
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter registered email carefully"
                      required
                    />
                    <small className="text-muted">Please enter your registered email address</small>
                  </div>

                  {/* Payment Summary */}
                  {amount && currency && (
                    <div className="alert alert-info mb-4">
                      <h6 className="alert-heading mb-2">
                        <i className="bi bi-info-circle me-2"></i>
                        Payment Summary
                      </h6>
                      <div className="d-flex justify-content-between">
                        <span>Amount:</span>
                        <strong>₹{parseFloat(amount || 0).toFixed(2)}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Currency:</span>
                        <strong>{currency}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Payment Gateway:</span>
                        <strong>RazorPay</strong>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading || !amount || !currency || !email}
                    >
                      {loading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-credit-card me-2"></i>
                          Proceed to Pay ₹{parseFloat(amount || 0).toFixed(2)}
                        </>
                      )}
                    </button>
                    
                    {/* Cancel/Back Button */}
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        if (window.opener) {
                          window.close()
                        } else {
                          window.history.back()
                        }
                      }}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Info */}
              <div className="card-footer bg-light text-center">
                <small className="text-muted">
                  <i className="bi bi-shield-check text-success me-1"></i>
                  Secured by RazorPay | 256-bit SSL Encryption
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddMoney