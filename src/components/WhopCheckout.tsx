import { useState } from 'react';
import {
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useAuth } from '../services/Auth';

interface WhopCheckoutProps {
  videoId: string;
  videoTitle: string;
  price: number;
  whopProductId?: string;
  disabled?: boolean;
}

const WhopCheckout: React.FC<WhopCheckoutProps> = ({
  videoId,
  videoTitle,
  price,
  whopProductId,
  disabled = false,
}) => {
  const { whopCompanyId } = useSiteConfig();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se o Whop está configurado
  const isWhopConfigured = !!whopCompanyId;

  // Função para redirecionar diretamente para o Whop
  const redirectToWhop = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🎯 Redirecting to Whop for video:', videoId);

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
      console.log('✅ Checkout URL:', data.checkoutUrl);

      // Redirecionar diretamente para o Whop em uma nova aba
      window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');

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

  // Se o Whop não estiver configurado, não renderizar nada
  if (!isWhopConfigured) {
    return null;
  }

  return (
    <>
      {/* Botão principal de compra - redireciona diretamente */}
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
        onClick={redirectToWhop}
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
    </>
  );
};

export default WhopCheckout;
