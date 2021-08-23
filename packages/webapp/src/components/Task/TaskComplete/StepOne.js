import Button from '../../Form/Button';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main } from '../../Typography';
import React from 'react';
import Form from '../../Form';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import RadioGroup from '../../Form/RadioGroup';
import PureCleaningTask from '../../AddTask/CleaningTask';
import PureSoilAmendmentTask from '../../AddTask/SoilAmendmentTask';
import PureFieldWorkTask from '../../AddTask/FieldWorkTask';
import PurePestControlTask from '../../AddTask/PestControlTask';
import { cloneObject } from '../../../util';
function PureCompleteStepOne({
  persistedFormData,
  onContinue,
  onGoBack,
  onCancel,
  selectedTaskType,
  selectedTask,
  farm,
  system,
  products,
  persistedPaths,
  useHookFormPersist,
}) {
  const { t } = useTranslation();
  const defaultsToUse = persistedFormData.need_changes
    ? cloneObject(persistedFormData)
    : cloneObject(selectedTask);
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: { need_changes: false, ...defaultsToUse },
  });

  const taskComponents = {
    CLEANING: (props) => (
      <PureCleaningTask farm={farm} system={system} products={products} {...props} />
    ),
    FIELD_WORK: (props) => <PureFieldWorkTask {...props} />,
    SOIL_AMENDMENT: (props) => (
      <PureSoilAmendmentTask farm={farm} system={system} products={products} {...props} />
    ),
    PEST_CONTROL: (props) => (
      <PurePestControlTask farm={farm} system={system} products={products} {...props} />
    ),
  };

  useHookFormPersist(getValues, persistedPaths);
  const CHANGES_NEEDED = 'need_changes';
  const changesRequired = watch(CHANGES_NEEDED);
  const taskType = selectedTaskType?.task_translation_key;

  return (
    <Form
      buttonGroup={
        <Button type={'submit'} disabled={!isValid} fullLength>
          {t('common:CONTINUE')}
        </Button>
      }
      onSubmit={handleSubmit(onContinue)}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle={t('TASK.ADD_TASK_FLOW')}
        title={t('TASK.COMPLETE_TASK')}
        value={33}
      />

      <Main style={{ marginBottom: '24px' }}>{t('TASK.COMPLETE_TASK_CHANGES')}</Main>
      <RadioGroup hookFormControl={control} required name={CHANGES_NEEDED} />
      {taskType &&
        taskComponents[taskType]({
          setValue,
          getValues,
          watch,
          control,
          register,
          disabled: !changesRequired,
        })}
    </Form>
  );
}

export default PureCompleteStepOne;