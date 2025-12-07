import { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Select, Button, Card, message, Row, Col, InputNumber, AutoComplete } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useAthleteStore } from '../stores/athleteStore';
import { useCompetitionStore } from '../../competition/stores/competitionStore';
import { WEIGHT_CLASSES, AGE_CATEGORIES } from '../../../shared/constants';
import { calculateAgeCategory } from '../../../shared/utils/calculations';

dayjs.extend(customParseFormat);

interface AthleteFormData {
  first_name: string;
  last_name: string;
  date_of_birth: dayjs.Dayjs;
  gender: 'M' | 'F';
  weight_class: string;
  division: string;
  age_category: string;
  lot_number?: number;
  bench_rack_height?: number;
}

export const AthleteForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { competitionId, athleteId } = useParams<{ competitionId: string; athleteId?: string }>();
  const { athletes, createAthlete, updateAthlete } = useAthleteStore();
  const { competitions } = useCompetitionStore();
  const [form] = Form.useForm<AthleteFormData>();
  const [loading, setLoading] = useState(false);
  const [selectedGender, setSelectedGender] = useState<'M' | 'F'>('M');
  const isEditMode = Boolean(athleteId);

  // Get competition format (kept for future use)
  const _competition = competitions.find(c => c.id === competitionId);
  void _competition; // Competition data available for future enhancements

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
          bench_rack_height: athlete.bench_rack_height || undefined,
        });
        setSelectedGender(athlete.gender as 'M' | 'F');
      }
    }
  }, [athleteId, athletes, form, isEditMode]);

  // Parse flexible date formats (DD/MM/YYYY, DD-MM-YYYY, etc.)
  const parseFlexibleDate = (value: string): dayjs.Dayjs | null => {
    const formats = ['DD/MM/YYYY', 'DD-MM-YYYY', 'D/M/YYYY', 'D-M-YYYY', 'YYYY-MM-DD'];
    for (const fmt of formats) {
      const parsed = dayjs(value, fmt, true);
      if (parsed.isValid()) {
        return parsed;
      }
    }
    return null;
  };

  // Handle weight class input with auto-selection
  const handleWeightClassSearch = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      const options = selectedGender === 'M' ? WEIGHT_CLASSES.men : WEIGHT_CLASSES.women;
      // Find exact match or closest match
      const exactMatch = options.find(wc => wc === `${numValue}` || wc === `${numValue}+`);
      if (exactMatch) {
        form.setFieldValue('weight_class', exactMatch);
      }
    }
  };

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
      message.error(t('competition.messages.error'));
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
        bench_rack_height: values.bench_rack_height,
      };

      if (isEditMode && athleteId) {
        await updateAthlete(athleteId, data);
        message.success(t('athlete.messages.updated'));
      } else {
        await createAthlete(data);
        message.success(t('athlete.messages.created'));
      }

      navigate(`/competitions/${competitionId}`);
    } catch (error) {
      message.error(t('athlete.messages.error'));
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
      title={isEditMode ? t('athlete.edit') : t('athlete.new')}
      extra={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/competitions/${competitionId}`)}
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
          division: 'raw',
          gender: 'M',
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="first_name"
              label={t('athlete.fields.firstName')}
              rules={[
                { required: true, message: t('athlete.form.firstNameRequired') },
                { min: 2, message: t('athlete.form.firstNameRequired') },
              ]}
            >
              <Input placeholder={t('athlete.form.firstNamePlaceholder')} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="last_name"
              label={t('athlete.fields.lastName')}
              rules={[
                { required: true, message: t('athlete.form.lastNameRequired') },
                { min: 2, message: t('athlete.form.lastNameRequired') },
              ]}
            >
              <Input placeholder={t('athlete.form.lastNamePlaceholder')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="date_of_birth"
              label={t('athlete.fields.dateOfBirth')}
              rules={[
                { required: true, message: t('athlete.form.dateRequired') },
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
                      return Promise.reject(new Error(t('athlete.form.dateRequired')));
                    }
                    if (age > 100) {
                      return Promise.reject(new Error(t('athlete.form.dateRequired')));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              getValueFromEvent={(date, dateString) => {
                // If date is already a dayjs object, use it
                if (dayjs.isDayjs(date)) return date;
                // Try to parse flexible format from string input
                if (typeof dateString === 'string' && dateString) {
                  const parsed = parseFlexibleDate(dateString);
                  if (parsed) return parsed;
                }
                return date;
              }}
            >
              <DatePicker
                style={{ width: '100%' }}
                format={['DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD']}
                onChange={handleDateChange}
                placeholder="JJ/MM/AAAA"
                disabledDate={(current) => {
                  return current && current > dayjs().endOf('day');
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="gender"
              label={t('athlete.fields.gender')}
              rules={[{ required: true, message: t('athlete.form.genderRequired') }]}
            >
              <Select
                onChange={handleGenderChange}
                options={[
                  { label: t('athlete.gender.M'), value: 'M' },
                  { label: t('athlete.gender.F'), value: 'F' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="weight_class"
              label={t('athlete.fields.weightClass')}
              rules={[{ required: true, message: t('athlete.form.weightClassRequired') }]}
            >
              <AutoComplete
                options={weightClassOptions.map((wc) => ({
                  label: wc,
                  value: wc,
                }))}
                placeholder={t('athlete.form.weightClassRequired')}
                onSearch={handleWeightClassSearch}
                filterOption={(inputValue, option) =>
                  option?.value.toString().includes(inputValue) || false
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="division"
              label={t('athlete.fields.division')}
              rules={[{ required: true, message: t('athlete.form.divisionRequired') }]}
            >
              <Select
                options={[
                  { label: t('athlete.division.raw'), value: 'raw' },
                  { label: t('athlete.division.equipped'), value: 'equipped' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="age_category"
              label={t('athlete.fields.ageCategory')}
              rules={[{ required: true, message: t('athlete.form.weightClassRequired') }]}
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
              label={t('athlete.fields.lotNumber')}
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                placeholder={t('athlete.fields.lotNumber')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            {t('common.save')}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
