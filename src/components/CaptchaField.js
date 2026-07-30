import React, { useEffect, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

const siteKey = process.env.REACT_APP_HCAPTCHA_SITE_KEY;

/**
 * hCaptcha widget — token is verified on the backend via api.hcaptcha.com/siteverify.
 */
function CaptchaField({ onChange, resetSignal }) {
  const captchaRef = useRef(null);

  useEffect(() => {
    if (resetSignal) {
      captchaRef.current?.resetCaptcha();
      onChange('');
    }
  }, [resetSignal, onChange]);

  if (!siteKey) {
    return (
      <p className="captcha-hint captcha-misconfigured" role="alert">
        Captcha is not configured. Set REACT_APP_HCAPTCHA_SITE_KEY in the frontend environment.
      </p>
    );
  }

  return (
    <div className="captcha-field captcha-hcaptcha">
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={(token) => onChange(token || '')}
        onExpire={() => onChange('')}
      />
    </div>
  );
}

export default CaptchaField;
