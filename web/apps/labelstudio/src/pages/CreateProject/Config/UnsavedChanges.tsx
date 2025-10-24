import { Button } from "@humansignal/ui";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LeaveBlocker, type LeaveBlockerCallbacks } from "../../../components/LeaveBlocker/LeaveBlocker";
import { modal } from "../../../components/Modal/Modal";
import { Space } from "../../../components/Space/Space";

type SaveAndLeaveButtonProps = {
  onSave: () => Promise<void>;
  text: string;
  ariaLabel: string;
};
const SaveAndLeaveButton = ({ onSave, text, ariaLabel }: SaveAndLeaveButtonProps) => {
  const [saving, setSaving] = useState(false);
  const saveHandler = useCallback(async () => {
    setSaving(true);
    await onSave();
    setSaving(false);
  }, [onSave]);
  return (
    <Button size="small" onClick={saveHandler} waiting={saving} aria-label={ariaLabel}>
      {text}
    </Button>
  );
};

type UnsavedChangesModalProps = {
  onSave: () => void;
  onCancel?: () => void;
  onDiscard?: () => void;
  cancelText?: string;
  discardText?: string;
  okText?: string;
  saveAriaLabel?: string;
  title?: string;
  body?: string;
};

export const unsavedChangesModal = ({
  onSave,
  onCancel,
  onDiscard,
  cancelText = "Cancel",
  discardText = "Discard and leave",
  okText = "Save and Leave",
  saveAriaLabel = "Save changes",
  title = "You have unsaved changes.",
  body = "Would you like to save them before leaving?",
  ...props
}: UnsavedChangesModalProps) => {
  let modalInstance: ReturnType<typeof modal> | undefined;
  const saveAndLeave = async () => {
    await onSave?.();
    modalInstance?.close();
  };
  modalInstance = modal({
    ...props,
    title,
    body: () => <>{body}</>,
    allowClose: true,
    footer: (
      <Space align="end">
        <Button
          look="outlined"
          size="small"
          onClick={() => {
            onCancel?.();
            modalInstance?.close();
          }}
          autoFocus
        >
          {cancelText}
        </Button>

        {onDiscard && (
          <Button
            variant="negative"
            look="outlined"
            onClick={() => {
              onDiscard?.();
              modalInstance?.close();
            }}
            size="small"
          >
            {discardText}
          </Button>
        )}

        <SaveAndLeaveButton onSave={saveAndLeave} text={okText} ariaLabel={saveAriaLabel} />
      </Space>
    ),
    style: { width: 512 },
    unique: "UNSAVED_CHANGES_MODAL",
  });
};

type UnsavedChangesProps = {
  hasChanges: boolean;
  onSave: () => boolean | void | Promise<boolean | void>;
};

/**
 * Component that blocks navigation if there are unsaved changes
 * @param hasChanges - flag that indicates if there are unsaved changes
 * @param onSave - function that should be called to save changes
 */
export const UnsavedChanges = ({ hasChanges, onSave }: UnsavedChangesProps) => {
  const { t } = useTranslation();
  const saveHandlerRef = useRef(onSave);
  saveHandlerRef.current = onSave;
  const blockHandler = useCallback(
    async ({ continueCallback, cancelCallback }: LeaveBlockerCallbacks) => {
      const wrappedOnSave = async () => {
        const result = await saveHandlerRef.current?.();
        if (result === true) {
          continueCallback && setTimeout(continueCallback, 0);
        } else {
          // We consider that user tries to save changes, but as long as there are some errors,
          // we just close the modal to allow user to see and fix them
          cancelCallback?.();
        }
      };

      unsavedChangesModal({
        onSave: wrappedOnSave,
        onCancel: cancelCallback,
        onDiscard: continueCallback,
        cancelText: t("actions.cancel"),
        discardText: t("projects.createProject.config.unsavedChanges.discard"),
        okText: t("actions.saveAndLeave"),
        saveAriaLabel: t("projects.createProject.config.unsavedChanges.saveAria"),
        title: t("projects.createProject.config.unsavedChanges.title"),
        body: t("projects.createProject.config.unsavedChanges.body"),
      });
    },
    [t],
  );

  return <LeaveBlocker active={hasChanges} onBlock={blockHandler} />;
};
