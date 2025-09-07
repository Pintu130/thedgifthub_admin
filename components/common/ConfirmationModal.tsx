"use client";

import { Button } from "@/components/ui/button";
import Modal from "@/components/common/Modal";

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
  isConfirmDisabled?: boolean;
  confirmVariant?: string;
  closeLabel?: string;
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDeleting = false,
  confirmVariant = "destructive",
}: ConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onConfirm={onConfirm}
      confirmText={isDeleting ? "Deleting..." : confirmText}
      confirmVariant={confirmVariant}
      isConfirmDisabled={isDeleting}
      closeLabel={cancelText}
    >
      <div className="py-4">
        <p className="text-gray-700 dark:text-gray-300">{description}</p>
      </div>
    </Modal>
  );
}
