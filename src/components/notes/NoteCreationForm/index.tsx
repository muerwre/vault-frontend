import React, { FC, useCallback, useState } from "react";

import { FormikConfig, useFormik } from "formik";
import { object, string, Asserts } from "yup";

import { Card } from "~/components/containers/Card";
import { Filler } from "~/components/containers/Filler";
import { Group } from "~/components/containers/Group";
import { Button } from "~/components/input/Button";
import { Textarea } from "~/components/input/Textarea";
import { useRandomPhrase } from "~/constants/phrases";
import { Note } from "~/types/notes";
import { getErrorMessage } from "~/utils/errors/getErrorMessage";
import { showErrorToast } from "~/utils/errors/showToast";

import styles from "./styles.module.scss";

interface NoteCreationFormProps {
  onSubmit: (text: string, callback: (note: Note) => void) => void;
  onCancel: () => void;
}

const validationSchema = object({
  text: string().required("Напишите что-нибудь"),
});

type Values = Asserts<typeof validationSchema>;

const NoteCreationForm: FC<NoteCreationFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const placeholder = useRandomPhrase("SIMPLE");

  const submit = useCallback<FormikConfig<Values>["onSubmit"]>(
    async ({ text }, { resetForm, setSubmitting, setErrors }) => {
      try {
        await onSubmit(text, () => resetForm());
      } catch (error) {
        const message = getErrorMessage(error);
        if (message) {
          setErrors({ text: message });
          return;
        }

        showErrorToast(error);
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmit],
  );

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    touched,
    handleBlur,
  } = useFormik<Values>({
    initialValues: { text: "" },
    validationSchema,
    onSubmit: submit,
  });

  return (
    <form onSubmit={handleSubmit}>
      <Card className={styles.card}>
        <div className={styles.row}>
          <Textarea
            handler={handleChange("text")}
            value={values.text}
            error={touched.text ? errors.text : undefined}
            onBlur={handleBlur("text")}
            placeholder={placeholder}
            autoFocus
          />
        </div>

        <Group horizontal className={styles.row}>
          <Filler />

          <Button size="mini" type="button" color="link" onClick={onCancel}>
            Отмена
          </Button>

          <Button size="mini" type="submit" color="gray">
            ОК
          </Button>
        </Group>
      </Card>
    </form>
  );
};

export { NoteCreationForm };
