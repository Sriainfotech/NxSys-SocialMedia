import { useAuthenticatedSrc } from '@/hooks/useAuthenticatedSrc';
import { cn } from '@/lib/utils';

interface AuthImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null | undefined;
  fallback?: React.ReactNode;
  wrapperClassName?: string;
}

/**
 * <img> wrapper that transparently handles ngrok's browser-warning page by
 * fetching the bytes via fetch() (with the skip-browser-warning header) and
 * serving them as a blob URL. For any non-ngrok URL it's a plain <img>.
 */
const AuthImage = ({ src, className, fallback, wrapperClassName, ...rest }: AuthImageProps) => {
  const resolved = useAuthenticatedSrc(src ?? '');

  if (!resolved) {
    // Still loading (or empty src) — show a skeleton that preserves layout
    return (
      <div
        className={cn('bg-slate-100 animate-pulse', wrapperClassName ?? className)}
        aria-hidden
      >
        {fallback}
      </div>
    );
  }

  return <img src={resolved} className={className} {...rest} />;
};

export default AuthImage;
