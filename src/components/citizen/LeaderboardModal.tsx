import React from 'react';
import { CivicImpactModal } from './CivicImpactModal';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = (props) => {
  return <CivicImpactModal {...props} />;
};
