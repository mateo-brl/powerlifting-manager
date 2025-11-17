import { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, Button, Card, message, Row, Col, InputNumber } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAthleteStore } from '../stores/athleteStore';
import { WEIGHT_CLASSES, AGE_CATEGORIES } from '../../../shared/constants';
import { calculateAgeCategory } from '../../../shared/utils/calculations';

interface AthleteFormData {
  first_name: string;
  last_name: string;
  date_of_birth: dayjs.Dayjs;
  gender: 'M' | 'F';
  weight_class: string;
  division: string;
  age_category: string;
  lot_number?: number;
  bodyweight?: number;
  squat_rack_height?: number;
  bench_rack_height?: number;
}

export const AthleteForm = () => {
  const navigate = useNavigate();
  const { competitionId, athleteId } = useParams<{ competitionId: string; athleteId?: string }>();
  const { athletes, createAthlete, updateAthlete } = useAthleteStore();
  const [form] = Form.useForm<AthleteFormData>();
  const [loading, setLoading] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const isEditMode = Boolean(athleteId);

  useEffect(() => {
    if (isEditMode && athleteId) {
      const athlete = athletes.find((a) => a.id === athleteId);
      if (athlete) {
        form.setFieldsValue({
          first_name: athlete.first_name,
          last_name: athlete.last_name,
          date_of_birth: dayjs(athlete.date_of_birth),
          gender: athlete.gender as 'M' | 'F',
          weight_class: athlete.weight_class,
          division: athlete.division,
          age_category: athlete.age_category,
          lot_number: athlete.lot_number || undefined,
          bodyweight: athlete.bodyweight || undefined,
          squat_rack_height: athlete.squat_rack_height || undefined,
          bench_rack_height: athlete.bench_rack_height || undefined,
        });
        setSelectedGender(athlete.gender as 'M' | 'F');
      }
    }
  }, [athleteId, athletes, form, isEditMode]);

  const handleGenderChange = (gender: 'M' | 'F') => {
    setSelectedGender(gender);
    // Reset weight class when gender changes
    form.setFieldValue('weight_class', undefined);
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const ageCategory = calculateAgeCategory(date.toDate());
      form.setFieldValue('age_category', ageCategory);
    }
  };

  const handleSubmit = async (values: AthleteFormData) => {
    if (!competitionId) {
      message.error('Competition ID is required');
      return;
    }

    setLoading(true);
    try {
      const data = {
        competition_id: competitionId,
        first_name: values.first_name,
        last_name: values.last_name,
        date_of_birth: values.date_of_birth.format('YYYY-MM-DD'),
        gender: values.gender,
        weight_class: values.weight_class,
        division: values.division,
        age_category: values.age_category,
        lot_number: values.lot_number,
        bodyweight: values.bodyweight,
        squat_rack_height: values.squat_rack_height,
        bench_rack_height: values.bench_rack_height,
      };

      if (isEditMode && athleteId) {
        await updateAthlete(athleteId, data);
        message.success('Athlete updated successfully');
      } else {
        await createAthlete(data);
        message.success('Athlete created successfully');
      }

      navigate(`/competitions/${competitionId}`);
    } catch (error) {
      message.error(`Failed to ${isEditMode ? 'update' : 'create'} athlete`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const weightClassOptions = selectedGender === 'M'
    ? WEIGHT_CLASSES.men
    : WEIGHT_CLASSES.women;

  return (
    <Card
      title={isEditMode ? 'Edit Athlete' : 'New Athlete'}
      extra={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/competitions/${competitionId}`)}
        >
          Back to Competition
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          division: 'raw',
          gender: 'M',
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="first_name"
              label="First Name"
              rules={[
                { required: true, message: 'Please enter first name' },
                { min: 2, message: 'Name must be at least 2 characters' },
              ]}
            >
              <Input placeholder="John" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="last_name"
              label="Last Name"
              rules={[
                { required: true, message: 'Please enter last name' },
                { min: 2, message: 'Name must be at least 2 characters' },
              ]}
            >
              <Input placeholder="Doe" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date_of_birth"
              label="Date of Birth"
              rules={[
                { required: true, message: 'Please select date of birth' },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const birthDate = value.toDate();
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();

                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                      age--;
                    }

                    if (age < 13) {
                      return Promise.reject(new Error('Athlete must be at least 13 years old'));
                    }
                    if (age > 100) {
                      return Promise.reject(new Error('Please enter a valid date of birth'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                onChange={handleDateChange}
                disabledDate={(current) => {
                  // Disable future dates
                  return current && current > dayjs().endOf('day');
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select gender' }]}
            >
              <Select
                onChange={handleGenderChange}
                options={[
                  { label: 'Male', value: 'M' },
                  { label: 'Female', value: 'F' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="weight_class"
              label="Weight Class"
              rules={[{ required: true, message: 'Please select weight class' }]}
            >
              <Select
                options={weightClassOptions.map((wc) => ({
                  label: wc,
                  value: wc,
                }))}
                placeholder="Select weight class"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="division"
              label="Division"
              rules={[{ required: true, message: 'Please select division' }]}
            >
              <Select
                options={[
                  { label: 'Raw', value: 'raw' },
                  { label: 'Equipped', value: 'equipped' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="age_category"
              label="Age Category"
              rules={[{ required: true, message: 'Please select age category' }]}
            >
              <Select>
                {AGE_CATEGORIES.map((cat) => (
                  <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="lot_number"
              label="Lot Number"
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                placeholder="Assigned lot number"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="bodyweight"
              label="Bodyweight (kg)"
            >
              <InputNumber
                min={0}
                step={0.1}
                style={{ width: '100%' }}
                placeholder="Weigh-in weight"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="squat_rack_height"
              label="Squat Rack Height"
            >
              <InputNumber
                min={1}
                max={20}
                style={{ width: '100%' }}
                placeholder="1-20"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="bench_rack_height"
              label="Bench Rack Height"
            >
              <InputNumber
                min={1}
                max={20}
                style={{ width: '100%' }}
                placeholder="1-20"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            {isEditMode ? 'Update Athlete' : 'Create Athlete'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
