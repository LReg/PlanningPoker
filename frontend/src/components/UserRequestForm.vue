<template>
  <a-form
      @submit.prevent="handleSubmit"
      layout="vertical"
  >
    <a-form-item
        :label="t('request.titleLabel')"
        :rules="[{ required: true, message: t('request.titleRequired') }]"
    >
      <a-input
          v-model:value="formData.title"
          :placeholder="t('request.titlePlaceholder')"
      />
    </a-form-item>

    <a-form-item
        :label="t('request.textLabel')"
        :rules="[{ required: true, message: t('request.textRequired') }]"
    >
      <a-textarea
          v-model:value="formData.text"
          :placeholder="t('request.textPlaceholder')"
          rows="4"
      />
    </a-form-item>

    <a-form-item>
      <div class="action-container">
        <a-button
            type="primary"
            html-type="submit"
            :loading="loading"
        >
          {{ t('request.submit') }}
        </a-button>
        <RouterLink to="/">
          <a-button type="default" class="guest-button">{{ t('common.home') }}</a-button>
        </RouterLink>
      </div>
    </a-form-item>
  </a-form>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import env from "@/environments/environments";
import environment from "@/environments/environments";

const { t } = useI18n();

// Props definieren
const props = defineProps({
  requestType: {
    type: String,
    required: true,
    validator(value: string) {
      return ['bugreport', 'changerequest'].includes(value);
    }
  }
});

// Daten definieren
const formData = ref({
  title: '',
  text: ''
});

const loading = ref(false);

// Methoden
const handleSubmit = async () => {
  if (!formData.value.title || !formData.value.text) {
    message.error(t('toast.requestFillBoth'));
    return;
  }
  if (environment.devServer) {
    formData.value.title = '[From Testserver] ' + formData.value.title;
  }
  loading.value = true;
  try {
    const response = await axios.post(`${env.apiServiceRoute}/${props.requestType}`, formData.value);

    if (response.status === 200) {
      message.success(t('toast.requestSuccess'));
    } else {
      message.error(t('toast.requestError'));
    }
  } catch (error: any) {
    if (error?.response?.status === 429)
      message.warn(t('toast.requestTooMany'));
    else
      message.error(t('toast.requestError'));
  } finally {
    loading.value = false;
    formData.value = {
      text: '',
      title: '',
    };
  }
};
</script>

<style scoped>
.action-container {
  display: flex;
  gap: 1rem;
}
.action-container :deep(.ant-btn) {
  border-radius: var(--radius-sm);
}
</style>
