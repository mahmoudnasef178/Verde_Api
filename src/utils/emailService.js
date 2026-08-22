const nodemailer = require('nodemailer');

/**
 * Generate HTML Email Template for Order Confirmation
 */
const generateOrderHtml = (order, userName) => {
  const orderId = order._id.toString().slice(-6).toUpperCase();
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const paymentText = order.paymentMethod === 'CARD' ? 'بطاقة ائتمان (تم الدفع)' : 'الدفع عند الاستلام (COD)';

  const itemsHtml = (order.orderItems || []).map(item => `
    <tr>
      <td style="padding: 12px 15px; border-bottom: 1px solid #1a2416; text-align: right;">
        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 12px;">
          <div>
            <strong style="color: #fafaf8; font-size: 15px; display: block;">${item.name}</strong>
            <span style="color: #8a9985; font-size: 13px;">الكمية: ${item.quantity}</span>
          </div>
          ${item.img ? `<img src="${item.img}" alt="${item.name}" style="width: 50px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #2a3824;" />` : ''}
        </div>
      </td>
      <td style="padding: 12px 15px; border-bottom: 1px solid #1a2416; text-align: left; color: #a8d5b5; font-weight: bold; font-size: 15px;">
        ${(item.price * item.quantity).toLocaleString('ar-EG')} ج.م
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تأكيد طلبك من VERDE PARFUMS</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #050804; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #fafaf8;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050804; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #0b1108; border: 1px solid #22301c; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">

              <!-- Header Banner -->
              <tr>
                <td align="center" style="padding: 35px 20px 25px; background: linear-gradient(180deg, #111a0d 0%, #0b1108 100%); border-bottom: 1px solid #22301c;">
                  <h1 style="margin: 0; font-family: Georgia, serif; font-size: 32px; letter-spacing: 4px; color: #fafaf8;">VERDE</h1>
                  <span style="font-size: 11px; letter-spacing: 6px; color: #5aad78; text-transform: uppercase; display: block; margin-top: 4px;">P A R F U M S</span>
                </td>
              </tr>

              <!-- Welcome Greeting -->
              <tr>
                <td style="padding: 30px 30px 15px;">
                  <h2 style="color: #a8d5b5; font-size: 22px; margin-top: 0; margin-bottom: 10px; font-weight: 500;">
                    أهلاً بك في عالم VERDE PARFUMS 🌿
                  </h2>
                  <p style="color: #d1dbcd; font-size: 15px; line-height: 1.7; margin: 0 0 15px;">
                    مرحباً <strong>${userName || 'عميلنا العزيز'}</strong>، سعداء جداً بتسوقك معنا!
                    تم استلام طلبك رقم <strong style="color: #5aad78;">#VRD-${orderId}</strong> بنجاح، وجاري تحضيره بكل عناية ليصلك في أسرع وقت.
                  </p>
                </td>
              </tr>

              <!-- Order Summary Box -->
              <tr>
                <td style="padding: 0 30px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #121c0e; border: 1px solid #1a2914; border-radius: 6px; padding: 15px 20px;">
                    <tr>
                      <td style="color: #8a9985; font-size: 13px; padding-bottom: 5px;">رقم الطلب: <strong style="color: #fafaf8;">#VRD-${orderId}</strong></td>
                      <td align="left" style="color: #8a9985; font-size: 13px; padding-bottom: 5px;">التاريخ: <strong style="color: #fafaf8;">${dateStr}</strong></td>
                    </tr>
                    <tr>
                      <td style="color: #8a9985; font-size: 13px;">طريقة الدفع: <strong style="color: #fafaf8;">${paymentText}</strong></td>
                      <td align="left" style="color: #8a9985; font-size: 13px;">الحالة: <strong style="color: #5aad78;">جاري التجهيز ⏳</strong></td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Order Items Table -->
              <tr>
                <td style="padding: 0 30px;">
                  <h3 style="color: #fafaf8; font-size: 16px; margin: 15px 0 10px; border-bottom: 1px solid #1a2914; padding-bottom: 8px;">
                    تفاصيل العطور المطلوبة
                  </h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>

              <!-- Totals Breakdown -->
              <tr>
                <td style="padding: 20px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #121c0e; border: 1px solid #1a2914; border-radius: 6px; padding: 15px 20px;">
                    <tr>
                      <td style="color: #8a9985; font-size: 14px; padding-bottom: 8px;">مجموع المنتجات:</td>
                      <td align="left" style="color: #fafaf8; font-size: 14px; padding-bottom: 8px;">${(order.itemsPrice || 0).toLocaleString('ar-EG')} ج.م</td>
                    </tr>
                    <tr style="border-top: 1px solid #22301c;">
                      <td style="color: #a8d5b5; font-size: 17px; font-weight: bold; padding-top: 10px;">الإجمالي الكلي:</td>
                      <td align="left" style="color: #5aad78; font-size: 20px; font-weight: bold; padding-top: 10px;">${(order.totalPrice || 0).toLocaleString('ar-EG')} ج.م</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Address Box -->
              <tr>
                <td style="padding: 0 30px 25px;">
                  <div style="background-color: #0e160b; border: 1px solid #1e2c18; border-radius: 6px; padding: 15px 20px;">
                    <h4 style="color: #a8d5b5; margin: 0 0 10px; font-size: 14px;">📍 عنوان التوصيل:</h4>
                    <p style="margin: 0; color: #d1dbcd; font-size: 13px; line-height: 1.6;">
                      <strong>${order.shippingAddress && order.shippingAddress.fullName ? order.shippingAddress.fullName : userName}</strong><br />
                      📞 ${order.shippingAddress && order.shippingAddress.phone ? order.shippingAddress.phone : ''}<br />
                      🏛️ ${order.shippingAddress && order.shippingAddress.city ? order.shippingAddress.city : ''} - ${order.shippingAddress && order.shippingAddress.address ? order.shippingAddress.address : ''}
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding: 25px 30px; background-color: #070c06; border-top: 1px solid #1a2914;">
                  <p style="color: #8a9985; font-size: 13px; margin: 0 0 15px; line-height: 1.5;">
                    إذا كان لديك أي استفسار حول طلبك، يمكنك التواصل معنا مباشرة عبر الواتساب:
                  </p>
                  <a href="https://wa.me/201112333598" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #5aad78, #3d8b5c); color: #0a0a0a; text-decoration: none; padding: 10px 24px; border-radius: 4px; font-weight: bold; font-size: 13px; letter-spacing: 1px;">
                    💬 التواصل عبر الواتساب
                  </a>
                  <div style="margin-top: 20px; font-size: 12px; color: #556650;">
                    تابعنا على انستغرام: <a href="https://www.instagram.com/verde_perfumes/" style="color: #5aad78; text-decoration: none;">@verde_perfumes</a>
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Send Order Confirmation Email via Resend HTTP API
 * Uses HTTPS (port 443) — works on Railway without SMTP port restrictions
 */
const sendOrderConfirmationEmail = async ({ order, userEmail, userName }) => {
  try {
    if (!userEmail) {
      console.log('⚠️ No user email provided');
      return { success: false, reason: 'No user email' };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log('⚠️ RESEND_API_KEY not set in environment');
      return { success: false, reason: 'No API key' };
    }

    const htmlContent = generateOrderHtml(order, userName);
    const orderId = order._id.toString().slice(-6).toUpperCase();

    // Use fetch (Node 18+) to call Resend HTTP API directly — no SMTP ports needed
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VERDE PARFUMS <onboarding@resend.dev>',
        to: [userEmail],
        subject: `🌿 تم استلام طلبك بنجاح | VERDE PARFUMS (#VRD-${orderId})`,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Resend API error:', JSON.stringify(data));
      return { success: false, error: data };
    }

    console.log(`✉️ Email sent successfully to ${userEmail} | ID: ${data.id}`);
    return { success: true, id: data.id };

  } catch (err) {
    console.error('❌ Email send error:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = { sendOrderConfirmationEmail };
