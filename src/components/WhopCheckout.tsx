import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useAuth } from '../services/Auth';

interface WhopCheckoutProps {
  videoId: string;
  videoTitle: string;
  price: number;
  disabled?: boolean;
}

const WhopCheckout: React.FC<WhopCheckoutProps> = ({
  videoId,
  videoTitle,
  price,
  disabled = false,
}) => {
  const { whopCompanyId } = useSiteConfig();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWhopEmbedLoaded, setIsWhopEmbedLoaded] = useState(false);

  // Verificar se o Whop está configurado
  const isWhopConfigured = !!whopCompanyId;

  // Carregar o script do Whop Checkout Embed
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.WhopCheckout) {
      const script = document.createElement('script');
      script.src = 'https://checkout.whop.com/sdk.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ Whop Checkout SDK loaded');
        setIsWhopEmbedLoaded(true);
      };
      document.body.appendChild(script);
    }
    return () => {
      const existingScript = document.querySelector(
        'script[src="https://checkout.whop.com/sdk.js"]'
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // Função para criar a sessão de checkout
  const createCheckoutSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🎯 Creating Whop checkout session for video:', videoId);

      const response = await fetch('/api/whop/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: videoId,
          userId: user?.id || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout');
      }

      const data = await response.json();
      console.log('✅ Checkout session created:', data);

      setCheckoutUrl(data.checkoutUrl);
      setShowModal(true);
    } catch (err) {
      console.error('❌ Error creating checkout:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create checkout. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Função para abrir o checkout em uma nova aba (fallback)
  const openCheckoutInNewTab = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Se o Whop não estiver configurado, não renderizar nada
  if (!isWhopConfigured) {
    return null;
  }

  return (
    <>
      {/* Botão principal de compra */}
      <Button
        variant="contained"
        fullWidth
        size="large"
        startIcon={
          isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <ShoppingCartCheckoutIcon />
          )
        }
        onClick={createCheckoutSession}
        disabled={isLoading || disabled}
        sx={{
          bgcolor: '#FF0F50',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          py: 1.5,
          '&:hover': {
            bgcolor: '#D10D42',
            transform: 'scale(1.02)',
          },
          '&:disabled': {
            bgcolor: '#666',
          },
        }}
      >
        {isLoading ? 'Processando...' : `Pagar $${price.toFixed(2)} com Whop`}
      </Button>

      {/* Mensagem de erro */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Modal do Checkout */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#1a1a1a',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="h6">Finalizar Compra</Typography>
            <Typography variant="body2" sx={{ color: '#aaa' }}>
              {videoTitle}
            </Typography>
          </Box>
          <IconButton onClick={() => setShowModal(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, minHeight: '500px' }}>
          {/* Se temos URL de checkout, usar iframe */}
          {checkoutUrl ? (
            <Box sx={{ position: 'relative', width: '100%', height: '600px' }}>
              <iframe
                src={checkoutUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title="Whop Checkout"
                onLoad={() => console.log('✅ Checkout iframe loaded')}
              />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '500px',
                gap: 2,
              }}
            >
              <CircularProgress />
              <Typography>Carregando checkout...</Typography>
            </Box>
          )}
        </DialogContent>

        {/* Botão para abrir em nova aba */}
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
            Problemas com o checkout?
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={openCheckoutInNewTab}
            disabled={!checkoutUrl}
          >
            Abrir em nova aba
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default WhopCheckout;
