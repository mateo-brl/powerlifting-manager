import { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, Button, Card, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useCompetitionStore } from '../stores/competitionStore';
import { FEDERATIONS } from '../../../shared/constants';

interface CompetitionFormData {
  name: string;
  date: dayjs.Dayjs;
  location?: string;
  federation: string;
}

export const CompetitionForm = () => {
  const navigate = useNavigate();
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
      };

      if (isEditMode && id) {
        await updateCompetition(id, data);
        message.success('Competition updated successfully');
      } else {
        await createCompetition(data);
        message.success('Competition created successfully');
      }

      navigate('/competitions');
    } catch (error) {
      message.error(`Failed to ${isEditMode ? 'update' : 'create'} competition`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={isEditMode ? 'Edit Competition' : 'New Competition'}
      extra={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/competitions')}
        >
          Back to List
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          federation: 'IPF',
        }}
      >
        <Form.Item
          name="name"
          label="Competition Name"
          rules={[
            { required: true, message: 'Please enter competition name' },
            { min: 3, message: 'Name must be at least 3 characters' },
          ]}
        >
          <Input placeholder="e.g., National Powerlifting Championship 2024" />
        </Form.Item>

        <Form.Item
          name="date"
          label="Date"
          rules={[
            { required: true, message: 'Please select competition date' },
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
          label="Location"
          rules={[{ min: 2, message: 'Location must be at least 2 characters' }]}
        >
          <Input placeholder="e.g., Paris, France" />
        </Form.Item>

        <Form.Item
          name="federation"
          label="Federation"
          rules={[{ required: true, message: 'Please select a federation' }]}
        >
          <Select
            options={FEDERATIONS.map((fed) => ({
              label: fed.label,
              value: fed.value,
            }))}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            {isEditMode ? 'Update Competition' : 'Create Competition'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
