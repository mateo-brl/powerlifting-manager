import { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, Button, Card, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useCompetitionStore } from '../stores/competitionStore';
import { FEDERATIONS } from '../../../shared/constants';
import { CompetitionFormat } from '../types';

interface CompetitionFormData {
  name: string;
  date: dayjs.Dayjs;
  location?: string;
  federation: string;
  format: CompetitionFormat;
}

export const CompetitionForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { competitions, createCompetition, updateCompetition } = useCompetitionStore();
  const [form] = Form.useForm<CompetitionFormData>();
  const [loading, setLoading] = useState(false);
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && id) {
      const competition = competitions.find((c) => c.id === id);
      if (competition) {
        form.setFieldsValue({
          name: competition.name,
          date: dayjs(competition.date),
          location: competition.location || undefined,
          federation: competition.federation,
          format: competition.format || 'full_power',
        });
      }
    }
  }, [id, competitions, form, isEditMode]);

  const handleSubmit = async (values: CompetitionFormData) => {
    setLoading(true);
    try {
      const data = {
        name: values.name,
        date: values.date.format('YYYY-MM-DD'),
        location: values.location || undefined,
        federation: values.federation,
        format: values.format,
      };

      if (isEditMode && id) {
        await updateCompetition(id, data);
        message.success(t('competition.messages.updated'));
      } else {
        await createCompetition(data);
        message.success(t('competition.messages.created'));
      }

      navigate('/competitions');
    } catch (error) {
      message.error(t('competition.messages.error'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={isEditMode ? t('competition.edit') : t('competition.new')}
      extra={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/competitions')}
        >
          {t('common.back')}
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          federation: 'IPF',
          format: 'full_power',
        }}
      >
        <Form.Item
          name="name"
          label={t('competition.fields.name')}
          rules={[
            { required: true, message: t('competition.form.nameRequired') },
            { min: 3, message: 'Name must be at least 3 characters' },
          ]}
        >
          <Input placeholder={t('competition.form.namePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="date"
          label={t('competition.fields.date')}
          rules={[
            { required: true, message: t('competition.form.dateRequired') },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const selectedDate = value.toDate();
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                const oneYearFuture = new Date();
                oneYearFuture.setFullYear(oneYearFuture.getFullYear() + 1);

                if (selectedDate < oneYearAgo) {
                  return Promise.reject(new Error('Competition date cannot be more than 1 year in the past'));
                }
                if (selectedDate > oneYearFuture) {
                  return Promise.reject(new Error('Competition date cannot be more than 1 year in the future'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          name="location"
          label={t('competition.fields.location')}
          rules={[{ min: 2, message: 'Location must be at least 2 characters' }]}
        >
          <Input placeholder={t('competition.form.locationPlaceholder')} />
        </Form.Item>

        <Form.Item
          name="federation"
          label={t('competition.fields.federation')}
          rules={[{ required: true, message: t('competition.form.federationRequired') }]}
        >
          <Select
            placeholder={t('competition.form.selectFederation')}
            options={FEDERATIONS.map((fed) => ({
              label: fed.label,
              value: fed.value,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="format"
          label={t('competition.format.label')}
          rules={[{ required: true, message: t('competition.form.formatRequired') }]}
        >
          <Select
            placeholder={t('competition.form.selectFormat')}
            options={[
              { value: 'full_power', label: t('competition.format.sbd') },
              { value: 'bench_only', label: t('competition.format.bench') },
            ]}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            {t('common.save')}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
