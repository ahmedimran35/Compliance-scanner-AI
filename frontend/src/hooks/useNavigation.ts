import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UseNavigationOptions {
  debounceMs?: number;
  onNavigate?: () => void;
}

export const useNavigation = (options: UseNavigationOptions = {}) => {
  const { debounceMs = 500, onNavigate } = options;
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useCallback((href: string) => {
    if (isNavigating) {
      console.log('🚫 Navigation blocked - already navigating');
      return;
    }

    console.log(`🚀 Navigating to: ${href}`);
    setIsNavigating(true);
    
    // Call optional callback
    onNavigate?.();
    
    // Navigate
    router.push(href);
    
    // Reset navigation state after debounce
    setTimeout(() => {
      setIsNavigating(false);
    }, debounceMs);
  }, [router, isNavigating, debounceMs, onNavigate]);

  const navigateBack = useCallback(() => {
    if (isNavigating) {
      console.log('🚫 Back navigation blocked - already navigating');
      return;
    }

    console.log('🚀 Navigating back');
    setIsNavigating(true);
    
    // Call optional callback
    onNavigate?.();
    
    // Navigate back
    router.back();
    
    // Reset navigation state after debounce
    setTimeout(() => {
      setIsNavigating(false);
    }, debounceMs);
  }, [router, isNavigating, debounceMs, onNavigate]);

  return {
    navigate,
    navigateBack,
    isNavigating
  };
}; 