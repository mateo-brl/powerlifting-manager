import { useState, useEffect } from 'react';
import { Form, InputNumber, Button, Card, Select, message, Descriptions, Tag, Row, Col, Alert } from 'antd';
import { SaveOutlined, CheckCircleOutlined, WarningOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  bench_safety_height?: number;
}

export const WeighInForm = () => {
  const { t } = useTranslation();
  const { competitionId } = useParams<{ competitionId: string }>();
  const navigate = useNavigate();
  const { athletes, loadAthletes } = useAthleteStore();
  const { weighIns, loadWeighIns, createWeighIn } = useWeighInStore();
  const [form] = Form.useForm<WeighInFormData>();
  const [loading, setLoading] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  const [weightClassValid, setWeightClassValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (competitionId) {
      loadAthletes(competitionId);
      loadWeighIns(competitionId);
    }
  }, [competitionId, loadAthletes, loadWeighIns]);

  const competitionAthletes = athletes.filter(a => a.competition_id === competitionId);
  const competitionWeighIns = weighIns.filter(w => w.competition_id === competitionId);

  // Filter out athletes who have already been weighed in
  const notWeighedIn = competitionAthletes.filter(athlete =>
    !competitionWeighIns.some(weighIn => weighIn.athlete_id === athlete.id)
  );

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
      message.error(t('competition.messages.error'));
      return;
    }

    if (weightClassValid === false) {
      message.error(t('weighIn.validation.bodyweightAboveClass'));
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
        bench_safety_height: values.bench_safety_height,
      });

      message.success(t('weighIn.messages.saved'));
      form.resetFields();
      setSelectedAthlete(null);
      setWeightClassValid(null);
    } catch (error) {
      message.error(t('weighIn.messages.error'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={t('weighIn.title')}
      style={{ maxWidth: 900, margin: '0 auto' }}
      extra={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/competitions/${competitionId}`)}
        >
          {t('common.back')}
        </Button>
      }
    >
      {competitionAthletes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Tag color={notWeighedIn.length === 0 ? 'success' : 'processing'} style={{ fontSize: 14, padding: '4px 12px' }}>
            {competitionWeighIns.length} / {competitionAthletes.length} {t('athlete.title')}
            {notWeighedIn.length === 0 && ' - ✓'}
          </Tag>
        </div>
      )}

      {notWeighedIn.length === 0 && competitionAthletes.length > 0 && (
        <Alert
          message={t('weighIn.messages.saved')}
          description={t('weighIn.messages.saved')}
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {selectedAthlete && (
        <Card type="inner" style={{ marginBottom: 24 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label={t('athlete.title')}>
              {selectedAthlete.first_name} {selectedAthlete.last_name}
            </Descriptions.Item>
            <Descriptions.Item label={t('athlete.fields.gender')}>
              <Tag color={selectedAthlete.gender === 'M' ? 'blue' : 'pink'}>
                {t(`athlete.gender.${selectedAthlete.gender}`)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('athlete.fields.weightClass')}>
              {selectedAthlete.weight_class}
            </Descriptions.Item>
            <Descriptions.Item label={t('athlete.fields.division')}>
              <Tag color={selectedAthlete.division === 'raw' ? 'green' : 'purple'}>
                {t(`athlete.division.${selectedAthlete.division}`).toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('athlete.fields.ageCategory')}>
              {selectedAthlete.age_category}
            </Descriptions.Item>
            <Descriptions.Item label={t('athlete.fields.lotNumber')}>
              {selectedAthlete.lot_number || '-'}
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
          label={t('weighIn.selectAthlete')}
          rules={[{ required: true, message: t('weighIn.messages.selectAthleteFirst') }]}
        >
          <Select
            placeholder={t('weighIn.selectAthlete')}
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
              label={t('weighIn.fields.bodyweight')}
              rules={[{ required: true, message: t('weighIn.form.bodyweightRequired') }]}
              extra={
                weightClassValid === true ? (
                  <span style={{ color: 'green' }}>
                    <CheckCircleOutlined /> {t('weighIn.validation.bodyweightAboveClass')}
                  </span>
                ) : weightClassValid === false ? (
                  <span style={{ color: 'red' }}>
                    <WarningOutlined /> {t('weighIn.validation.bodyweightAboveClass')} {selectedAthlete.weight_class}
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
                placeholder={t('weighIn.fields.bodyweight')}
              />
            </Form.Item>

            <Card type="inner" title={t('weighIn.openingAttempts')} style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="opening_squat"
                    label={t('weighIn.fields.openingSquat')}
                    rules={[
                      { required: true, message: t('weighIn.form.squatRequired') },
                      { validator: (_, value) => validateOpeningAttempt(value, 20) },
                    ]}
                  >
                    <InputNumber
                      min={20}
                      step={2.5}
                      style={{ width: '100%' }}
                      placeholder={t('weighIn.fields.openingSquat')}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="opening_bench"
                    label={t('weighIn.fields.openingBench')}
                    rules={[
                      { required: true, message: t('weighIn.form.benchRequired') },
                      { validator: (_, value) => validateOpeningAttempt(value, 20) },
                    ]}
                  >
                    <InputNumber
                      min={20}
                      step={2.5}
                      style={{ width: '100%' }}
                      placeholder={t('weighIn.fields.openingBench')}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="opening_deadlift"
                    label={t('weighIn.fields.openingDeadlift')}
                    rules={[
                      { required: true, message: t('weighIn.form.deadliftRequired') },
                      { validator: (_, value) => validateOpeningAttempt(value, 20) },
                    ]}
                  >
                    <InputNumber
                      min={20}
                      step={2.5}
                      style={{ width: '100%' }}
                      placeholder={t('weighIn.fields.openingDeadlift')}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card type="inner" title={t('weighIn.rackHeights')}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="squat_rack_height"
                    label={t('weighIn.fields.squatRackHeight')}
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
                    label={t('weighIn.fields.benchRackHeight')}
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
                    name="bench_safety_height"
                    label={t('weighIn.fields.benchSafetyHeight')}
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
                {t('weighIn.messages.saved')}
              </Button>
            </Form.Item>
          </>
        )}
      </Form>
    </Card>
  );
};
