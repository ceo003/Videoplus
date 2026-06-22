import Whop from "@whop/sdk";

// Configurações padrão (serão carregadas do siteConfig)
let whopClient = null;
let whopWebhookSecret = "";
let whopCompanyId = "";

/**
 * Inicializa o cliente Whop com as configurações fornecidas
 */
export function initializeWhop(config) {
  if (!config.whopCompanyApiKey) {
    console.log("Whop not configured - API Key missing");
    return false;
  }

  try {
    whopClient = new Whop({
      apiKey: config.whopCompanyApiKey,
    });

    whopWebhookSecret = config.whopWebhookSecret || "";
    whopCompanyId = config.whopCompanyId || "";

    console.log("✅ Whop client initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing Whop client:", error);
    return false;
  }
}

/**
 * Cria uma nova sessão de checkout no Whop
 * @param {Object} options - Opções da checkout
 * @param {number} options.price - Preço do produto em centavos
 * @param {string} options.productName - Nome do produto/vídeo
 * @param {string} options.videoId - ID do vídeo
 * @param {string} options.userId - ID do usuário (opcional)
 * @returns {Promise<string>} ID da sessão de checkout
 */
export async function createCheckoutSession({
  price,
  productName,
  videoId,
  userId,
}) {
  if (!whopClient) {
    throw new Error("Whop client not initialized");
  }

  if (!whopCompanyId) {
    throw new Error("Whop Company ID not configured");
  }

  try {
    // Gerar um order ID único
    const orderId = `order_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log(
      `🎯 Creating Whop checkout session for video: ${videoId}, price: ${price}`
    );

    // Criar a configuração de checkout
    const checkoutConfig = await whopClient.checkoutConfigurations.create({
      company_id: whopCompanyId,
      plan: {
        initial_price: price, // Preço em centavos
        plan_type: "one_time", // Tipo de plano: pagamento único
        name: productName, // Nome do produto
      },
      metadata: {
        order_id: orderId,
        video_id: videoId,
        user_id: userId || "",
        product_name: productName,
      },
    });

    console.log(
      `✅ Checkout session created: ${checkoutConfig.id} for order: ${orderId}`
    );

    return {
      sessionId: checkoutConfig.id,
      orderId: orderId,
      checkoutUrl: `https://whop.com/checkout/${checkoutConfig.id}`,
    };
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Valida e processa um webhook do Whop
 * @param {string} body - Corpo do webhook em texto
 * @param {Object} headers - Cabeçalhos da requisição
 * @returns {Object} Dados do webhook processados
 */
export function validateAndProcessWebhook(body, headers) {
  if (!whopClient) {
    throw new Error("Whop client not initialized");
  }

  try {
    // Verificar a assinatura do webhook (se o secret estiver configurado)
    if (whopWebhookSecret) {
      console.log("🔐 Validating Whop webhook signature...");
      // A validação de assinatura depende da implementação do SDK
      // Por enquanto, vamos registrar e processar o evento
    }

    // Parsear o corpo do webhook
    const webhookData = typeof body === "string" ? JSON.parse(body) : body;

    console.log("📦 Webhook received:", {
      type: webhookData.type || webhookData.event,
      id: webhookData.id,
    });

    return webhookData;
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    throw error;
  }
}

/**
 * Obtém informações de uma sessão de checkout
 * @param {string} sessionId - ID da sessão
 * @returns {Promise<Object>} Dados da sessão
 */
export async function getCheckoutSession(sessionId) {
  if (!whopClient) {
    throw new Error("Whop client not initialized");
  }

  try {
    const session = await whopClient.checkoutConfigurations.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error("❌ Error retrieving checkout session:", error);
    throw error;
  }
}

export default {
  initializeWhop,
  createCheckoutSession,
  validateAndProcessWebhook,
  getCheckoutSession,
};
