/**
 * Credit Display Utilities
 * 
 * Format credits for user-friendly display.
 */

import { CreditDisplayInfo, CreditOperationType } from './types';

/**
 * Format credits for display
 */
export function formatCredits(
  credits: number,
  lowThreshold = 10
): CreditDisplayInfo {
  const isLow = credits <= lowThreshold;
  
  return {
    credits,
    displayText: `${credits} Credits`,
    displayShort: `${credits}`,
    isLow,
    warningText: isLow ? `Nur noch ${credits} Credits übrig` : undefined,
  };
}

/**
 * Format credits for specific operation types
 */
export function formatCreditsForOperation(
  credits: number,
  operationType: CreditOperationType
): string {
  const labels: Partial<Record<CreditOperationType, string>> = {
    ai_generation: 'KI-Generierungen',
    ai_chat: 'Chat-Nachrichten',
    image_generation: 'Bilder',
    video_generation: 'Videos',
    document_processing: 'Dokumente',
    api_call: 'API-Aufrufe',
  };

  const label = labels[operationType] || 'Credits';
  return `${credits} ${label}`;
}

/**
 * Format credit cost with currency equivalent
 */
export function formatCreditCost(
  credits: number,
  pricePerCredit = 0.10
): string {
  const price = (credits * pricePerCredit).toFixed(2);
  return `${credits} Credits (~${price}€)`;
}

/**
 * Get operation type label
 */
export function getOperationLabel(operationType: CreditOperationType): string {
  const labels: Record<CreditOperationType, string> = {
    ai_generation: 'KI-Generierung',
    ai_chat: 'Chat',
    image_generation: 'Bildgenerierung',
    video_generation: 'Videogenerierung',
    document_processing: 'Dokumentverarbeitung',
    api_call: 'API-Aufruf',
    purchase: 'Kauf',
    refund: 'Rückerstattung',
    bonus: 'Bonus',
    subscription: 'Abonnement',
    admin_adjustment: 'Admin-Anpassung',
  };

  return labels[operationType] || operationType;
}

/**
 * Format transaction amount with sign
 */
export function formatTransactionAmount(amount: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${amount} Credits`;
}

/**
 * Check if credits are low
 */
export function isLowCredits(credits: number, threshold = 10): boolean {
  return credits <= threshold;
}

