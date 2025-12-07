import { useState } from 'react';
import { Input, AutoComplete, Button, Card, Space, Tag, Alert, Typography, Divider, message } from 'antd';
import { CheckCircleOutlined, WarningOutlined, SafetyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import {
  AthleteEquipment,
  EquipmentFormValues,
  EquipmentCategory,
  EQUIPMENT_CATEGORY_LABELS,
} from '../types/equipment';
import {
  getApprovedBrandNames,
  isIPFApproved,
} from '../../../shared/constants/ipfEquipment';

const { Text, Title } = Typography;

interface EquipmentValidatorProps {
  weighInId: string;
  athleteName: string;
  initialEquipment?: AthleteEquipment;
  onSaved?: () => void;
}

interface EquipmentFieldProps {
  category: EquipmentCategory;
  label: string;
  required: boolean;
  brandValue?: string;
  descriptionValue?: string;
  onBrandChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

const EquipmentField = ({
  category,
  label,
  required,
  brandValue,
  descriptionValue,
  onBrandChange,
  onDescriptionChange,
}: EquipmentFieldProps) => {
  const { t } = useTranslation();
  const brands = getApprovedBrandNames(category === 'singlet' ? 'singlets' : category === 'belt' ? 'belts' : category === 'knee_sleeves' ? 'knee_sleeves' : category === 'wrist_wraps' ? 'wrist_wraps' : 'shoes');
  const isApproved = brandValue ? isIPFApproved(category === 'singlet' ? 'singlets' : category === 'belt' ? 'belts' : category === 'knee_sleeves' ? 'knee_sleeves' : category === 'wrist_wraps' ? 'wrist_wraps' : 'shoes', brandValue) : false;

  const brandOptions = brands.map((brand) => ({ value: brand, label: brand }));

  return (
    <Card size="small" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Space>
          <Text strong>{label}</Text>
          {required && <Tag color="red">{t('equipment.required')}</Tag>}
        </Space>
        {brandValue && (
          isApproved ? (
            <Tag icon={<CheckCircleOutlined />} color="success">
              {t('equipment.ipfApproved')}
            </Tag>
          ) : (
            <Tag icon={<WarningOutlined />} color="warning">
              {t('equipment.notIPFApproved')}
            </Tag>
          )
        )}
      </div>
      <Space style={{ width: '100%' }} direction="vertical" size="small">
        <AutoComplete
          style={{ width: '100%' }}
          options={brandOptions}
          value={brandValue}
          onChange={onBrandChange}
          placeholder={t('equipment.brandPlaceholder')}
          filterOption={(inputValue, option) =>
            option?.value.toLowerCase().includes(inputValue.toLowerCase()) ?? false
          }
        />
        <Input
          placeholder={t('equipment.descriptionPlaceholder')}
          value={descriptionValue}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </Space>
    </Card>
  );
};

export const EquipmentValidator = ({
  weighInId,
  athleteName,
  initialEquipment,
  onSaved,
}: EquipmentValidatorProps) => {
  const { t, i18n } = useTranslation();
  const [equipment, setEquipment] = useState<EquipmentFormValues>({
    singlet: initialEquipment?.equipment_singlet || '',
    singlet_brand: initialEquipment?.equipment_singlet_brand || '',
    belt: initialEquipment?.equipment_belt || '',
    belt_brand: initialEquipment?.equipment_belt_brand || '',
    knee_sleeves: initialEquipment?.equipment_knee_sleeves || '',
    knee_sleeves_brand: initialEquipment?.equipment_knee_sleeves_brand || '',
    wrist_wraps: initialEquipment?.equipment_wrist_wraps || '',
    wrist_wraps_brand: initialEquipment?.equipment_wrist_wraps_brand || '',
    shoes: initialEquipment?.equipment_shoes || '',
    shoes_brand: initialEquipment?.equipment_shoes_brand || '',
  });
  const [validatorName, setValidatorName] = useState('');
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);

  const currentLang = i18n.language as 'fr' | 'en';

  const hasNonApprovedEquipment = () => {
    const checks = [
      { brand: equipment.singlet_brand, category: 'singlets' as const },
      { brand: equipment.belt_brand, category: 'belts' as const },
      { brand: equipment.knee_sleeves_brand, category: 'knee_sleeves' as const },
      { brand: equipment.wrist_wraps_brand, category: 'wrist_wraps' as const },
      { brand: equipment.shoes_brand, category: 'shoes' as const },
    ];

    return checks.some(({ brand, category }) => brand && !isIPFApproved(category, brand));
  };

  const getMissingRequired = (): EquipmentCategory[] => {
    const missing: EquipmentCategory[] = [];
    if (!equipment.singlet_brand) missing.push('singlet');
    if (!equipment.shoes_brand) missing.push('shoes');
    return missing;
  };

  const handleSaveEquipment = async () => {
    setSaving(true);
    try {
      await invoke('update_athlete_equipment', {
        input: {
          weigh_in_id: weighInId,
          equipment_singlet: equipment.singlet || null,
          equipment_singlet_brand: equipment.singlet_brand || null,
          equipment_belt: equipment.belt || null,
          equipment_belt_brand: equipment.belt_brand || null,
          equipment_knee_sleeves: equipment.knee_sleeves || null,
          equipment_knee_sleeves_brand: equipment.knee_sleeves_brand || null,
          equipment_wrist_wraps: equipment.wrist_wraps || null,
          equipment_wrist_wraps_brand: equipment.wrist_wraps_brand || null,
          equipment_shoes: equipment.shoes || null,
          equipment_shoes_brand: equipment.shoes_brand || null,
        },
      });
      message.success(t('equipment.saveSuccess'));
      onSaved?.();
    } catch (error) {
      console.error('Failed to save equipment:', error);
      message.error(t('equipment.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleValidateEquipment = async () => {
    if (!validatorName.trim()) {
      message.warning(t('equipment.validatorNameRequired'));
      return;
    }

    const missingRequired = getMissingRequired();
    if (missingRequired.length > 0) {
      message.warning(t('equipment.missingRequiredEquipment'));
      return;
    }

    setValidating(true);
    try {
      // First save the equipment
      await handleSaveEquipment();

      // Then validate
      await invoke('validate_equipment', {
        input: {
          weigh_in_id: weighInId,
          validator_name: validatorName,
        },
      });
      message.success(t('equipment.validateSuccess'));
      onSaved?.();
    } catch (error) {
      console.error('Failed to validate equipment:', error);
      message.error(t('equipment.validateError'));
    } finally {
      setValidating(false);
    }
  };

  const updateEquipment = (field: keyof EquipmentFormValues, value: string) => {
    setEquipment((prev) => ({ ...prev, [field]: value }));
  };

  const missingRequired = getMissingRequired();

  return (
    <Card
      title={
        <Space>
          <SafetyOutlined />
          {t('equipment.validationTitle')}
        </Space>
      }
    >
      <Alert
        message={t('equipment.athleteEquipment', { name: athleteName })}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Required Equipment */}
      <Title level={5}>{t('equipment.requiredEquipment')}</Title>

      <EquipmentField
        category="singlet"
        label={EQUIPMENT_CATEGORY_LABELS.singlet[currentLang]}
        required={true}
        brandValue={equipment.singlet_brand}
        descriptionValue={equipment.singlet}
        onBrandChange={(value) => updateEquipment('singlet_brand', value)}
        onDescriptionChange={(value) => updateEquipment('singlet', value)}
      />

      <EquipmentField
        category="shoes"
        label={EQUIPMENT_CATEGORY_LABELS.shoes[currentLang]}
        required={true}
        brandValue={equipment.shoes_brand}
        descriptionValue={equipment.shoes}
        onBrandChange={(value) => updateEquipment('shoes_brand', value)}
        onDescriptionChange={(value) => updateEquipment('shoes', value)}
      />

      <Divider />

      {/* Optional Equipment */}
      <Title level={5}>{t('equipment.optionalEquipment')}</Title>

      <EquipmentField
        category="belt"
        label={EQUIPMENT_CATEGORY_LABELS.belt[currentLang]}
        required={false}
        brandValue={equipment.belt_brand}
        descriptionValue={equipment.belt}
        onBrandChange={(value) => updateEquipment('belt_brand', value)}
        onDescriptionChange={(value) => updateEquipment('belt', value)}
      />

      <EquipmentField
        category="knee_sleeves"
        label={EQUIPMENT_CATEGORY_LABELS.knee_sleeves[currentLang]}
        required={false}
        brandValue={equipment.knee_sleeves_brand}
        descriptionValue={equipment.knee_sleeves}
        onBrandChange={(value) => updateEquipment('knee_sleeves_brand', value)}
        onDescriptionChange={(value) => updateEquipment('knee_sleeves', value)}
      />

      <EquipmentField
        category="wrist_wraps"
        label={EQUIPMENT_CATEGORY_LABELS.wrist_wraps[currentLang]}
        required={false}
        brandValue={equipment.wrist_wraps_brand}
        descriptionValue={equipment.wrist_wraps}
        onBrandChange={(value) => updateEquipment('wrist_wraps_brand', value)}
        onDescriptionChange={(value) => updateEquipment('wrist_wraps', value)}
      />

      <Divider />

      {/* Warnings */}
      {missingRequired.length > 0 && (
        <Alert
          message={t('equipment.missingRequired')}
          description={missingRequired.map((cat) => EQUIPMENT_CATEGORY_LABELS[cat][currentLang]).join(', ')}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {hasNonApprovedEquipment() && (
        <Alert
          message={t('equipment.nonApprovedWarning')}
          description={t('equipment.nonApprovedDescription')}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Validation Section */}
      <Card size="small" style={{ marginTop: 16, background: '#f5f5f5' }}>
        <Title level={5}>{t('equipment.validation')}</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder={t('equipment.validatorNamePlaceholder')}
            value={validatorName}
            onChange={(e) => setValidatorName(e.target.value)}
            prefix={<Text type="secondary">{t('equipment.validatorName')}:</Text>}
          />
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleSaveEquipment} loading={saving}>
              {t('equipment.saveOnly')}
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleValidateEquipment}
              loading={validating}
              disabled={missingRequired.length > 0}
            >
              {t('equipment.validateEquipment')}
            </Button>
          </Space>
        </Space>
      </Card>

      {initialEquipment?.equipment_validated && (
        <Alert
          message={t('equipment.alreadyValidated')}
          description={t('equipment.validatedBy', {
            name: initialEquipment.equipment_validator_name,
            date: initialEquipment.equipment_validation_timestamp
              ? new Date(initialEquipment.equipment_validation_timestamp * 1000).toLocaleString()
              : '',
          })}
          type="success"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
};
