import { createAuthenticatedClient, isFinalizedGrant, OpenPaymentsClientError } from '@interledger/open-payments';
import { readFileSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import qrcode from 'qrcode';

// Cargar variables de entorno
dotenv.config();

// Configuración
const merchantWallet = process.env.WALLET_ADDRESS_URL; // Wallet del merchant/negocio
const keyId = process.env.KEY_ID;
const PORT = process.env.PORT || 3007;

// Para testing: wallet del turista que hará el pago
const touristWallet = process.env.DEMO_SENDER_WALLET;


// Cliente autenticado (reutilizable)
let authenticatedClient = null;


/**
 * Obtiene o crea un cliente autenticado para el merchant
 */
async function getClient() {
  if (authenticatedClient) {
    return authenticatedClient;
  }

  try {
    const privateKeyPath = process.env.PRIVATE_KEY_PATH || path.join(process.cwd(), 'private.key');
   
    console.log("Private key path:", privateKeyPath);
   
    const privateKey = readFileSync(privateKeyPath, 'utf8');
   
    // Crear cliente autenticado para el merchant
    authenticatedClient = await createAuthenticatedClient({
      walletAddressUrl: merchantWallet,
      privateKey: privateKey,
      keyId: keyId
    });

    console.log("✓ Merchant authenticated client created");
    return authenticatedClient;

  } catch (error) {
    console.error("Error creating client:", error.message);
    throw error;
  }
}


/**
 * Obtiene información de un wallet
 */
async function getWalletInfo(walletUrl) {
  const client = await getClient();
 
  try {
    const walletInfo = await client.walletAddress.get({
      url: walletUrl
    });

    console.log(`✓ Wallet info retrieved: ${walletInfo.id}`);
    return walletInfo;

  } catch (error) {
    console.error("Error getting wallet info:", error.message);
    throw error;
  }
}

/**
 * Genera un QR code para que el turista escanee y pague
 * Este es el punto de entrada principal para el merchant
 */
async function generatePaymentQR(amount, description, expiresInMinutes = 60) {
  try {
    const client = await getClient();
    const merchantWalletInfo = await getWalletInfo(merchantWallet);

    console.log(`\n=== Generating Payment QR ===`);
    console.log(`Amount: ${amount} ${merchantWalletInfo.assetCode}`);
    console.log(`Description: ${description}`);

    // Solicitar grant para crear incoming payment
    const incomingGrant = await client.grant.request(
      {
        url: merchantWalletInfo.authServer,
      },
      {
        access_token: {
          access: [
            {
              type: "incoming-payment",
              actions: ["read", "complete", "create"],
            },
          ],
        },
      },
    );

    if (!isFinalizedGrant(incomingGrant)) {
      throw new Error('Expected finalized incoming payment grant');
    }

    console.log("✓ Incoming payment grant created");

    // Crear incoming payment en el wallet del merchant
    const incomingPayment = await client.incomingPayment.create(
      {
        url: merchantWalletInfo.resourceServer,
        accessToken: incomingGrant.access_token.value,
      },
      {
        walletAddress: merchantWalletInfo.id,
        incomingAmount: {
          value: Math.round(amount * Math.pow(10, merchantWalletInfo.assetScale)).toString(),
          assetCode: merchantWalletInfo.assetCode,
          assetScale: merchantWalletInfo.assetScale,
        },
        expiresAt: new Date(Date.now() + expiresInMinutes * 60_000).toISOString(),
        metadata: {
          description: description || 'Payment request'
        }
      }
    );

    console.log("✓ Created incoming payment:", incomingPayment.id);

    // Generar QR code con la URL del incoming payment
    const qrCodeDataUrl = await qrcode.toDataURL(incomingPayment.id);

    console.log("✓ QR code generated");

    return {
      success: true,
      incomingPaymentUrl: incomingPayment.id,
      qrCodeDataUrl: qrCodeDataUrl,
      amount: amount,
      assetCode: merchantWalletInfo.assetCode,
      description: description,
      expiresAt: incomingPayment.expiresAt,
      message: 'QR code ready for tourist to scan'
    };

  } catch (error) {
    console.error("Error generating payment QR:", error);
    throw new Error(`Failed to generate payment QR: ${error.message}`);
  }
}


/**
 * Crea un quote para calcular costos (usado por el turista)
 */
async function createQuote(incomingPaymentUrl, touristWalletAddress) {
  try {
    const client = await getClient();
    const sendingWallet = await getWalletInfo(touristWalletAddress);

    console.log(`\nCreating quote for payment to ${incomingPaymentUrl}`);

    // Solicitar grant para quote
    const quoteGrant = await client.grant.request(
      {
        url: sendingWallet.authServer,
      },
      {
        access_token: {
          access: [
            {
              type: "quote",
              actions: ["create", "read"],
            },
          ],
        },
      },
    );

    if (!isFinalizedGrant(quoteGrant)) {
      throw new Error("Expected finalized quote grant");
    }

    console.log("✓ Quote grant created");

    // Crear quote
    const quote = await client.quote.create(
      {
        url: sendingWallet.resourceServer,
        accessToken: quoteGrant.access_token.value,
      },
      {
        method: "ilp",
        walletAddress: sendingWallet.id,
        receiver: incomingPaymentUrl
      }
    );

    console.log("✓ Created quote:", quote.id);

    return quote;

  } catch (error) {
    console.error("Error creating quote:", error);
    throw new Error(`Failed to create quote: ${error.message}`);
  }
}

/**
 * Crea un outgoing payment (requiere autorización del turista)
 */
async function createOutgoingPayment(quote, touristWalletAddress) {
  try {
    const client = await getClient();
    const sendingWallet = await getWalletInfo(touristWalletAddress);

    console.log(`\nCreating outgoing payment for quote: ${quote.id}`);

    // Solicitar grant con interacción
    const outgoingPaymentGrant = await client.grant.request(
      {
        url: sendingWallet.authServer,
      },
      {
        access_token: {
          access: [
            {
              identifier: sendingWallet.id,
              type: "outgoing-payment",
              actions: ["read", "create"],
              limits: {
                debitAmount: quote.debitAmount
              }
            },
          ],
        },
        interact: {
          start: ["redirect"]
        }
      },
    );

    console.log('✓ Got pending outgoing payment grant');

    // Verificar si requiere autorización
    if (outgoingPaymentGrant.interact && outgoingPaymentGrant.interact.redirect) {
      console.log('✓ Payment requires tourist authorization');
     
      return {
        requiresInteraction: true,
        interactionUrl: outgoingPaymentGrant.interact.redirect,
        continueUri: outgoingPaymentGrant.continue.uri,
        continueToken: outgoingPaymentGrant.continue.access_token.value,
        message: "Tourist must authorize the payment in their wallet"
      };
    }

    throw new Error("Unexpected grant state");
   
  } catch (error) {
    console.error("Error in createOutgoingPayment:", error);
    throw new Error(`Failed to create outgoing payment: ${error.message}`);
  }
}


/**
 * FUNCIÓN DE SIMULACIÓN: Simula que el turista escanea el QR y completa el pago
 * En producción, el turista usaría su propia wallet app
 */
async function simulateTouristPayment(incomingPaymentUrl, touristWalletAddress) {
  try {
    console.log(`\n=== Simulating Tourist Payment ===`);
    console.log(`Tourist wallet: ${touristWalletAddress}`);
    console.log(`Payment URL: ${incomingPaymentUrl}`);

    // Paso 1: Crear quote (calcular costos)
    console.log("\n[Step 1/2] Creating quote...");
    const quote = await createQuote(incomingPaymentUrl, touristWalletAddress);
     
    // Paso 2: Crear outgoing payment (turista autoriza)
    console.log("\n[Step 2/2] Creating outgoing payment...");
    const outgoingPayment = await createOutgoingPayment(quote, touristWalletAddress);

    // Formatear montos
    const debitAmount = {
      value: quote.debitAmount.value / Math.pow(10, quote.debitAmount.assetScale),
      assetCode: quote.debitAmount.assetCode,
      formatted: `${quote.debitAmount.value / Math.pow(10, quote.debitAmount.assetScale)} ${quote.debitAmount.assetCode}`
    };

    const receiveAmount = {
      value: quote.receiveAmount.value / Math.pow(10, quote.receiveAmount.assetScale),
      assetCode: quote.receiveAmount.assetCode,
      formatted: `${quote.receiveAmount.value / Math.pow(10, quote.receiveAmount.assetScale)} ${quote.receiveAmount.assetCode}`
    };

    if (outgoingPayment.requiresInteraction) {
      console.log("\n✓ Payment setup complete - awaiting tourist authorization");
     
      return {
        success: true,
        status: 'PENDING_AUTHORIZATION',
        requiresInteraction: true,
        authorizationUrl: outgoingPayment.interactionUrl,
        continueToken: outgoingPayment.continueToken,
        continueUri: outgoingPayment.continueUri,
        quoteId: quote.id,
        debitAmount: debitAmount,
        receiveAmount: receiveAmount,
        message: 'Tourist must authorize the payment in their wallet'
      };
    }
   
    console.log("\n✓ Payment completed without interaction");

    return {
      success: true,
      status: 'COMPLETED',
      paymentId: outgoingPayment.paymentId,
      quoteId: quote.id,
      debitAmount: debitAmount,
      receiveAmount: receiveAmount,
      message: 'Payment completed successfully'
    };
   
  } catch (error) {
    console.error("\n✗ Error in tourist payment:", error);

    return {
      success: false,
      status: 'FAILED',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}


/**
 * Completa el pago después de que el turista autoriza
 */
async function completePaymentAfterAuth(quoteId, continueUri, continueToken, touristWalletAddress) {
  try {
    const client = await getClient();
    const sendingWallet = await getWalletInfo(touristWalletAddress);

    console.log('\n=== Completing Payment After Authorization ===');
   
    // Continuar el grant con la autorización
    const finalizedGrant = await client.grant.continue({
      url: continueUri,
      accessToken: continueToken
    });

    console.log("✓ Grant finalized after authorization");

    if (!isFinalizedGrant(finalizedGrant)) {
      throw new Error('Grant was not finalized after authorization');
    }

    // Crear el outgoing payment final
    const outgoingPayment = await client.outgoingPayment.create(
      {
        url: sendingWallet.resourceServer,
        accessToken: finalizedGrant.access_token.value,
      },
      {
        walletAddress: sendingWallet.id,
        quoteId: quoteId,
      },
    );

    console.log("✓ Payment created:", outgoingPayment.id);
    console.log("✓ Payment state:", outgoingPayment.state);

    return {
      success: true,
      status: 'COMPLETED',
      paymentId: outgoingPayment.id,
      state: outgoingPayment.state,
      message: 'Payment completed successfully'
    };

  } catch (error) {
    console.error("✗ Error completing payment:", error);
    return {
      success: false,
      status: 'FAILED',
      error: error.message
    };
  }
}

/**
 * Verifica el estado de un incoming payment
 */
async function checkPaymentStatus(incomingPaymentUrl) {
  try {
    const client = await getClient();
    const merchantWalletInfo = await getWalletInfo(merchantWallet);

    // Solicitar grant para leer incoming payment
    const grant = await client.grant.request(
      {
        url: merchantWalletInfo.authServer,
      },
      {
        access_token: {
          access: [
            {
              type: "incoming-payment",
              actions: ["read"],
            },
          ],
        },
      },
    );

    if (!isFinalizedGrant(grant)) {
      throw new Error('Expected finalized grant');
    }

    // Obtener el estado del incoming payment
    const payment = await client.incomingPayment.get({
      url: incomingPaymentUrl,
      accessToken: grant.access_token.value,
    });

    return {
      success: true,
      completed: payment.completed,
      receivedAmount: payment.receivedAmount,
      incomingAmount: payment.incomingAmount,
      expiresAt: payment.expiresAt,
      metadata: payment.metadata
    };

  } catch (error) {
    console.error("Error checking payment status:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// EXPRESS SERVER - API ENDPOINTS
// ============================================

async function startServer() {
  const app = express();
  app.use(express.json());

  // Endpoint 1: Generar QR code para pago (usado por el merchant)
  app.post('/generate-payment-qr', async (req, res) => {
    try {
      const { amount, description, expiresInMinutes } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ 
          error: 'Invalid amount',
          message: 'Amount must be a positive number'
        });
      }

      const result = await generatePaymentQR(amount, description, expiresInMinutes);
      
      res.json(result);

    } catch (error) {
      console.error('Error in /generate-payment-qr:', error);
      res.status(500).json({ 
        error: 'Error generating payment QR code',
        message: error.message
      });
    }
  });

  // Endpoint 2: Verificar estado del pago (usado por el merchant)
  app.get('/payment-status/:paymentId', async (req, res) => {
    try {
      const paymentUrl = decodeURIComponent(req.params.paymentId);
      
      const status = await checkPaymentStatus(paymentUrl);
      
      res.json(status);

    } catch (error) {
      console.error('Error in /payment-status:', error);
      res.status(500).json({ 
        error: 'Error checking payment status',
        message: error.message
      });
    }
  });

  // Endpoint 3: Simular pago del turista (SOLO PARA TESTING)
  app.post('/simulate-tourist-payment', async (req, res) => {
    try {
      const { incomingPaymentUrl, touristWalletAddress } = req.body;

      if (!incomingPaymentUrl) {
        return res.status(400).json({ 
          error: 'Missing incomingPaymentUrl',
          message: 'incomingPaymentUrl is required'
        });
      }

      // Usar el wallet del turista desde .env si no se proporciona
      const walletToUse = touristWalletAddress || touristWallet;

      if (!walletToUse) {
        return res.status(400).json({ 
          error: 'Missing tourist wallet',
          message: 'touristWalletAddress is required or set DEMO_SENDER_WALLET in .env'
        });
      }

      const result = await simulateTouristPayment(incomingPaymentUrl, walletToUse);
      
      res.json(result);

    } catch (error) {
      console.error('Error in /simulate-tourist-payment:', error);
      res.status(500).json({ 
        error: 'Error simulating tourist payment',
        message: error.message
      });
    }
  });

  // Endpoint 4: Completar pago después de autorización (SOLO PARA TESTING)
  app.post('/complete-payment', async (req, res) => {
    try {
      const { quoteId, continueUri, continueToken, touristWalletAddress } = req.body;

      if (!quoteId || !continueUri || !continueToken) {
        return res.status(400).json({ 
          error: 'Missing parameters',
          message: 'quoteId, continueUri, and continueToken are required'
        });
      }

      const walletToUse = touristWalletAddress || touristWallet;

      const result = await completePaymentAfterAuth(quoteId, continueUri, continueToken, walletToUse);
      
      res.json(result);

    } catch (error) {
      console.error('Error in /complete-payment:', error);
      res.status(500).json({ 
        error: 'Error completing payment',
        message: error.message
      });
    }
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok',
      merchant: merchantWallet,
      timestamp: new Date().toISOString()
    });
  });

  app.listen(PORT, () => {
    console.log(`\nMerchant Payment Server running on port ${PORT}`);
    console.log(`Merchant wallet: ${merchantWallet}`);
    console.log(`\nAvailable endpoints:`);
    console.log(`  POST /generate-payment-qr - Generate QR code for payment`);
    console.log(`  GET  /payment-status/:paymentId - Check payment status`);
    console.log(`  POST /simulate-tourist-payment - Simulate tourist payment (testing)`);
    console.log(`  POST /complete-payment - Complete payment after auth (testing)`);
    console.log(`  GET  /health - Health check\n`);
  });
}

// Start the server
startServer().catch(console.error);
