import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '../logger';

export function useInteractionLogger() {
  const location = useLocation();

  useEffect(() => {
    logger.info(`Page View: ${location.pathname}${location.search}`, {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
    });
  }, [location]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      const interactiveElement = target.closest(
        'button, a, input[type="submit"], input[type="button"]',
      );

      if (interactiveElement) {
        const elementInfo = {
          tagName: interactiveElement.tagName,
          id: interactiveElement.id,
          className: interactiveElement.className,
          text: interactiveElement.textContent?.trim().substring(0, 50),
          type: (interactiveElement as HTMLButtonElement | HTMLInputElement)
            .type,
          href: (interactiveElement as HTMLAnchorElement).href,
        };

        logger.info(
          `User Interaction: Click on ${interactiveElement.tagName.toLowerCase()}`,
          {
            element: elementInfo,
            path: window.location.pathname,
          },
        );
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    const handleSubmit = (event: SubmitEvent) => {
      const target = event.target as HTMLFormElement;

      logger.info(`User Interaction: Form Submission`, {
        formId: target.id,
        formAction: target.action,
        path: window.location.pathname,
      });
    };

    window.addEventListener('submit', handleSubmit);
    return () => window.removeEventListener('submit', handleSubmit);
  }, []);
}
