import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../../Layout';
import Button from '../../Form/Button';
import { PureSnackbar } from '../../PureSnackbar';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { useForm, Controller } from 'react-hook-form';
import { Main, Label } from '../../Typography';
import styles from '../../CertificationReportingPeriod/styles.module.scss';
import ReactSelect from '../../Form/ReactSelect';
import RadioGroup from '../../Form/RadioGroup';
import Input, { getInputErrors, integerOnKeyDown } from '../../Form/Input';

const PureTaskAssignment = ({
  onSubmit,
  handleGoBack,
  handleCancel,
  onError,
  userFarmOptions,
  wageData,
  isFarmWorker,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      assignee: userFarmOptions.length === 1 ? userFarmOptions[0] : undefined,
      override_hourly_wage: false,
    },
  });

  const OVERRIDE_HOURLY_WAGE = 'override_hourly_wage';
  const override = watch(OVERRIDE_HOURLY_WAGE);
  const WAGE_OVERRIDE = 'wage_override';
  let wage_override = watch(WAGE_OVERRIDE);
  const currently_assigned = watch('assignee');

  // const overrideWage = () => {
  //   wage_override = currently_assigned.wage.amount;
  //   console.log("hello");
  // }

  return (
    <>
      <Form
        buttonGroup={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: '16px', flexGrow: 1 }}>
            <Button color={'primary'} fullLength>
              {t('common:SAVE')}
            </Button>
          </div>
        }
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <MultiStepPageTitle
          style={{ marginBottom: '24px' }}
          onGoBack={handleGoBack}
          onCancel={handleCancel}
          title={t('ADD_TASK.ADD_A_TASK')}
          cancelModalTitle={t('ADD_TASK.CANCEL')}
          value={86}
        />

        <Main className={styles.mainText}>{t('ADD_TASK.DO_YOU_WANT_TO_ASSIGN')}</Main>

        <Controller
          control={control}
          name={'assignee'}
          render={({ field }) => (
            <ReactSelect
              //onChange={overrideWage}
              options={userFarmOptions}
              label={t('ADD_TASK.ASSIGNEE')}
              optional={true}
              {...field}
            />
          )}
          rules={{ required: true }}
        />

        {!isFarmWorker && (
          <>
            <Main className={styles.mainText} style={{ paddingTop: '35px' }}>
              {t('ADD_TASK.DO_YOU_NEED_TO_OVERRIDE')}
            </Main>

            <RadioGroup
              hookFormControl={control}
              style={{ marginBottom: '16px' }}
              name={OVERRIDE_HOURLY_WAGE}
              radios={[
                {
                  label: t('LOG_DETAIL.YES'),
                  value: true,
                },
                {
                  label: t('LOG_DETAIL.NO'),
                  value: false,
                  defaultChecked: true,
                },
              ]}
              required
            />
          </>
        )}

        {override && (
          <div>
            <Main>{t('ADD_TASK.WAGE_OVERRIDE')}</Main>
            <Input
              hookFormRegister={register(WAGE_OVERRIDE, {
                required: true,
                valueAsNumber: true,
              })}
              type={'number'}
              onKeyDown={integerOnKeyDown}
              max={100000000}
              errors={getInputErrors(errors, WAGE_OVERRIDE)}
            />
          </div>
        )}

        {currently_assigned?.label}
        {currently_assigned?.value}
      </Form>
    </>
  );
};

export default PureTaskAssignment;
