<template>
  <div class="detail-panel" :class="{ 'is-active': selectedMember }">
    <div v-if="selectedMember">
      <header>
        <h3>{{ selectedMember.nick }}님 상세정보</h3>
      </header>
      <main>
        <div class="detail-item"><span class="label">이름</span><span class="value">{{ selectedMember.nick }}</span></div>
        <div class="detail-item"><span class="label">이메일</span><span class="value">{{ selectedMember.email }}</span></div>
        <div class="detail-item"><span class="label">전화번호</span><span class="value">{{ selectedMember.phone }}</span></div>
        <div class="detail-item"><span class="label">나이</span><span class="value">{{ selectedMember.age }}</span></div>
        <div class="detail-item"><span class="label">성별</span><span class="value">{{ selectedMember.gender === 'M' ? '남자' : '여자' }}</span></div>
      </main>
      <footer>
        <button @click="onEdit" class="button-secondary">수정</button>
        <button @click="onDelete" class="button-danger">삭제</button>
      </footer>
    </div>
    <div v-else class="placeholder">
      <p>목록에서 회원을 선택해주세요.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Member } from '@/types/member';
const props = defineProps<{ selectedMember: Member | null }>();
const emit = defineEmits<{(e: 'edit', member: Member): void; (e: 'delete', member: Member): void;}>();
const onEdit = () => { if (props.selectedMember) emit('edit', props.selectedMember) };
const onDelete = () => { if (props.selectedMember) emit('delete', props.selectedMember) };
</script>

<style scoped>
:root {
  --primary-color: hsl(260, 65%, 60%);
  --danger-color: hsl(354, 70%, 54%);
  --border-color: #e0e0e0;
}

.detail-panel {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  background-color: #fff;
  transition: all 0.3s ease-in-out;
  height: 100%;
  box-sizing: border-box;
}
.detail-panel.is-active {
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: var(--primary-color);
}
.placeholder { 
  display: flex;
  justify-content: center;
  align-items: center;
  color: #888;
  min-height: 200px;
  background-color: #fcfcfc;
}

header { 
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
header h3 { 
  margin: 0;
  font-size: 1.3rem;
  color: var(--primary-color);
  font-weight: 600;
}

.detail-item { display: flex; padding: 0.9rem 0; font-size: 1rem; }
.label { width: 90px; font-weight: 500; color: #555; flex-shrink: 0; }
.value { word-break: break-all; }

footer { 
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
button { 
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}
button:active { transform: translateY(1px); }
.button-secondary { background-color: #f8f9fa; }
.button-secondary:hover { background-color: #e9ecef; border-color: #ccc; }
.button-danger { background-color: var(--danger-color); color: white; border-color: var(--danger-color); }
.button-danger:hover { opacity: 0.85; }
</style>