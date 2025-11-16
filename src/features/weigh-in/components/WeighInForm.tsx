import { useState, useEffect } from 'react';
import { Form, InputNumber, Button, Card, Select, message, Descriptions, Tag, Row, Col } from 'antd';
import { SaveOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useAthleteStore } from '../../athlete/stores/athleteStore';
import { useWeighInStore } from '../stores/weighInStore';
import { isWeightClassValid } from '../../../shared/utils/calculations';

interface WeighInFormData {
  athlete_id: string;
  bodyweight: number;
  opening_squat: number;
  opening_bench: number;
  opening_deadlift: number;
  squat_rack_height?: number;
  bench_rack_height?: number;
}

export const WeighInForm = () => {
  const { competitionId } = useParams<{ competitionId: string }>();
  const { athletes, loadAthletes } = useAthleteStore();
  const { createWeighIn } = useWeighInStore();
  const [form] = Form.useForm<WeighInFormData>();
  const [loading, setLoading] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  const [weightClassValid, setWeightClassValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (competitionId) {
      loadAthletes(competitionId);
    }
  }, [competitionId, loadAthletes]);

  const competitionAthletes = athletes.filter(a => a.competition_id === competitionId);
  const notWeighedIn = competitionAthletes; // TODO: filter out already weighed in

  const handleAthleteSelect = (athleteId: string) => {
    const athlete = competitionAthletes.find(a => a.id === athleteId);
    if (athlete) {
      setSelectedAthlete(athlete);
      form.setFieldsValue({
        squat_rack_height: athlete.squat_rack_height,
        bench_rack_height: athlete.bench_rack_height,
      });
    }
  };

  const handleBodyweightChange = (value: number | null) => {
    if (value && selectedAthlete) {
      const isValid = isWeightClassValid(
        value,
        selectedAthlete.weight_class,
        selectedAthlete.gender
      );
      setWeightClassValid(isValid);
    }
  };

  const validateOpeningAttempt = (value: number | null, min: number = 2.5) => {
    if (!value || value < min) {
      return Promise.reject(new Error(`Minimum ${min}kg required`));
    }
    return Promise.resolve();
  };

  const handleSubmit = async (values: WeighInFormData) => {
    if (!competitionId) {
      message.error('Competition ID is required');
      return;
    }

    if (weightClassValid === false) {
      message.error('Bodyweight does not match weight class!');
      return;
    }

    setLoading(true);
    try {
      await createWeighIn({
        athlete_id: values.athlete_id,
        competition_id: competitionId,
        bodyweight: values.bodyweight,
        opening_squat: values.opening_squat,
        opening_bench: values.opening_bench,
        opening_deadlift: values.opening_deadlift,
        squat_rack_height: values.squat_rack_height,
        bench_rack_height: values.bench_rack_height,
      });

      message.success('Weigh-in completed successfully');
      form.resetFields();
      setSelectedAthlete(null);
      setWeightClassValid(null);
    } catch (error) {
      message.error('Failed to complete weigh-in');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Weigh-In / Pesée" style={{ maxWidth: 900, margin: '0 auto' }}>
      {selectedAthlete && (
        <Card type="inner" style={{ marginBottom: 24 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Athlete">
              {selectedAthlete.first_name} {selectedAthlete.last_name}
            </Descriptions.Item>
            <Descriptions.Item label="Gender">
              <Tag color={selectedAthlete.gender === 'M' ? 'blue' : 'pink'}>
                {selectedAthlete.gender}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Weight Class">
              {selectedAthlete.weight_class}
            </Descriptions.Item>
            <Descriptions.Item label="Division">
              <Tag color={selectedAthlete.division === 'raw' ? 'green' : 'purple'}>
                {selectedAthlete.division.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Age Category">
              {selectedAthlete.age_category}
            </Descriptions.Item>
            <Descriptions.Item label="Lot Number">
              {selectedAthlete.lot_number || 'Not assigned'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="athlete_id"
          label="Select Athlete"
          rules={[{ required: true, message: 'Please select an athlete' }]}
        >
          <Select
            placeholder="Select athlete to weigh in"
            onChange={handleAthleteSelect}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={notWeighedIn.map(athlete => ({
              label: `${athlete.last_name}, ${athlete.first_name} (${athlete.weight_class})`,
              value: athlete.id,
            }))}
          />
        </Form.Item>

        {selectedAthlete && (
          <>
            <Form.Item
              name="bodyweight"
              label="Bodyweight (kg)"
              rules={[{ required: true, message: 'Please enter bodyweight' }]}
              extra={
                weightClassValid === true ? (
                  <span style={{ color: 'green' }}>
                    <CheckCircleOutlined /> Weight class valid
                  </span>
                ) : weightClassValid === false ? (
                  <span style={{ color: 'red' }}>
                    <WarningOutlined /> Weight does NOT match class {selectedAthlete.weight_class}
                  </span>
                ) : null
              }
            >
              <InputNumber
                min={30}
                max={200}
                step={0.1}
                precision={2}
                style={{ width: '100%' }}
                onChange={handleBodyweightChange}
                placeholder="Weighed bodyweight"
              />
            </Form.Item>

            <Card type="inner" title="Opening Attempts" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="opening_squat"
                    label="Squat (kg)"
                    rules={[
                      { required: true, message: 'Required' },
                      { validator: (_, value) => validateOpeningAttempt(value, 20) },
                    ]}
                  >
                    <InputNumber
                      min={20}
                      step={2.5}
                      style={{ width: '100%' }}
                      placeholder="Opening squat"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="opening_bench"
                    label="Bench Press (kg)"
                    rules={[
                      { required: true, message: 'Required' },
                      { validator: (_, value) => validateOpeningAttempt(value, 20) },
                    ]}
                  >
                    <InputNumber
                      min={20}
                      step={2.5}
                      style={{ width: '100%' }}
                      placeholder="Opening bench"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="opening_deadlift"
                    label="Deadlift (kg)"
                    rules={[
                      { required: true, message: 'Required' },
                      { validator: (_, value) => validateOpeningAttempt(value, 20) },
                    ]}
                  >
                    <InputNumber
                      min={20}
                      step={2.5}
                      style={{ width: '100%' }}
                      placeholder="Opening deadlift"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card type="inner" title="Rack Heights (Optional)">
              <Row gutter={16}>
                <Col span={12}>
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
                <Col span={12}>
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
            </Card>

            <Form.Item style={{ marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
                block
              >
                Complete Weigh-In
              </Button>
            </Form.Item>
          </>
        )}
      </Form>
    </Card>
  );
};
