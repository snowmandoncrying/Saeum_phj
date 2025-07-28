<template>
  <transition name="modal-fade">
    <div v-if="isVisible" class="modal-overlay" @click.self="closePopup">
      <div class="modal-content">
        <header>
          <h2>{{ title }}</h2>
          <button @click="closePopup" class="close-button" aria-label="팝업 닫기">&times;</button>
        </header>

        <main>
          </main>

        <footer>
          <button v-if="mode === 'add' || mode === 'edit'" @click="handleSave" class="button-primary">
            {{ mode === 'edit' ? '수정' : '저장' }}
          </button>
          <button v-if="mode === 'delete'" @click="handleDeleteConfirm" class="button-danger">삭제</button>
          <button @click="closePopup" class="button-secondary">취소</button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { Member, CreateMemberDTO, UpdateMemberDTO } from '@/types/member';
import { createMember, updateMember, deleteMember } from '@/api/memberApi';

const props = defineProps<{ isVisible: boolean; mode: 'add' | 'edit' | 'delete'; memberData: Member | null; }>();
const emit = defineEmits<{(e: 'close'): void; (e: 'save'): void; (e: 'deleteSuccess', userKey: number): void; }>();
const editableMember = ref<Partial<CreateMemberDTO & UpdateMemberDTO>>({ nick: '', phone: '', email: '', age: undefined, gender: 'M' });
const errors = ref<Partial<Record<keyof CreateMemberDTO, string>>>({});
const title = computed(() => {
  if (props.mode === 'add') return '회원 추가';
  if (props.mode === 'edit') return '회원 정보 수정';
  if (props.mode === 'delete') return '삭제 팝업';
  return '';
});
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    errors.value = {};
    if (props.mode === 'add' || !props.memberData) {
      editableMember.value = { nick: '', phone: '', email: '', age: undefined, gender: 'M' };
    } else {
      editableMember.value = { ...props.memberData };
    }
  }
});
const closePopup = () => emit('close');
const validateForm = (): boolean => {
  errors.value = {};
  const { nick, phone, email, age } = editableMember.value;
  let isValid = true;
  if (!nick?.trim()) { errors.value.nick = '이름을 입력해주세요.'; isValid = false; }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) { errors.value.email = '올바른 이메일 형식을 입력해주세요.'; isValid = false; }
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  if (!phone?.match(phoneRegex)) { errors.value.phone = '전화번호 형식을 확인해주세요. (010-0000-0000)'; isValid = false; }
  if (age && (age < 1 || age > 150)) { errors.value.age = '유효한 나이를 입력해주세요.'; isValid = false; }
  return isValid;
};
const handleSave = async () => {
  if (!validateForm()) return;
  try {
    if (props.mode === 'add') { await createMember(editableMember.value as CreateMemberDTO) }
    else if (props.mode === 'edit' && props.memberData) { await updateMember(props.memberData.userKey, editableMember.value as UpdateMemberDTO) }
    emit('save');
  } catch (error) { alert('저장에 실패했습니다.'); }
};
const handleDeleteConfirm = async () => {
  if (!props.memberData) return;
  try {
    await deleteMember(props.memberData.userKey);
    emit('deleteSuccess', props.memberData.userKey);
  } catch (error) { alert('삭제에 실패했습니다.'); }
};
</script>

<style scoped>
:root {
  --primary-color: hsl(260, 65%, 60%);
  --primary-hover-color: hsl(260, 65%, 50%);
  --danger-color: hsl(354, 70%, 54%);
  --border-color: #ddd;
  --selected-bg-color: hsl(260, 100%, 97%);
}

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 2rem; border-radius: 12px; width: 90%; max-width: 450px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; padding-bottom: 1rem; margin-bottom: 1.5rem; }
header h2 { margin: 0; color: var(--primary-color); font-size: 1.3rem; }
.close-button { border: none; background: none; font-size: 1.8rem; cursor: pointer; color: #aaa; transition: color 0.2s; }
.close-button:hover { color: #333; }

.form-group { margin-bottom: 1.2rem; }
.form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
.form-group input { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box; transition: all 0.2s; }
.form-group input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 3px var(--selected-bg-color); outline: none; }
.radio-group { display: flex; gap: 1.5rem; align-items: center; }
.radio-group label { display: flex; align-items: center; gap: 0.5rem; }
.error-message { color: var(--danger-color); font-size: 0.8rem; margin-top: 0.25rem; }

footer { display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid #f0f0f0; padding-top: 1.5rem; margin-top: 1.5rem; }
button { padding: 0.6rem 1.2rem; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; transition: all 0.2s; }
button:active { transform: translateY(1px); }
.button-primary { background-color: var(--primary-color); color: white; }
.button-primary:hover { background-color: var(--primary-hover-color); }
.button-danger { background-color: var(--danger-color); color: white; }
.button-danger:hover { opacity: 0.85; }
.button-secondary { background-color: #f8f9fa; border: 1px solid var(--border-color); }
.button-secondary:hover { background-color: #e9ecef; }
.warning { color: var(--danger-color); font-size: 14px; text-align: center; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-content, .modal-fade-leave-active .modal-content { transition: transform 0.3s ease; }
.modal-fade-enter-from .modal-content, .modal-fade-leave-to .modal-content { transform: scale(0.95) translateY(10px); }
</style>