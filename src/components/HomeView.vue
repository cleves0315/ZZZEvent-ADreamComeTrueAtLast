<script setup lang="ts"></script>

<template>
  <div class="qq-block">
    <div class="dialog-list">
      <!-- <div class="dialog-item">
        <div class="dialog-avatar">?</div>
        <div class="dialog-content">
          <div class="dialog-name">???</div>
          <div class="dialog-time">
            <div class="dialog-time-tag"></div>
            <div class="dialog-time-txt">11小时后</div>
          </div>
        </div>
      </div> -->
      <div class="dialog-item" v-for="i in 4" :key="i">
        <div class="dialog-avatar">?</div>
        <div class="dialog-content">
          <div class="dialog-name">???</div>
          <div class="dialog-time">
            <div class="dialog-time-tag"></div>
            <div class="dialog-time-txt">11小时后</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="qq-block-bottom"></div>
  <div class="task-btn"></div>
</template>

<style scoped lang="scss">
.qq-block {
  width: 15rem;
  height: 10.5rem;
  position: absolute;
  top: 0;
  left: 2.1rem;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-image: url(../assets/qq_block.png);
}
.qq-block-bottom {
  position: absolute;
  bottom: 0;
  left: 2.1rem;
  width: 8rem;
  height: 1.22rem;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-image: url(../assets/qq_block_bottom.png);
}
.dialog-list {
  position: absolute;
  top: 1.8rem;
  left: 2.22rem;
  gap: 0.2rem;
  display: flex;
  flex-direction: column;

  .dialog-item {
    display: flex;
    align-items: center;
    gap: 0.1rem;
    width: 3.4rem;
    height: 1.4rem;
    border-radius: 9999px;
    border: 0.08rem solid #c4a7f5;
    background-color: #60438e;
    padding: 0 0.14rem;
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .dialog-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    font-size: 0.8rem;
    border-radius: 50%;
    color: #141215;
    background-color: #c4a7f5;
  }

  .dialog-name {
    color: #fff;
    font-size: 0.38rem;
  }
  .dialog-time {
    background-color: #9874db;
    border-radius: 9999px;
    color: #141215;
    font-size: 0.22rem;
    padding: 0.14rem 0.15rem;
    width: 1.6rem;
    display: flex;
    align-items: center;
    gap: 0.08rem;
  }
  .dialog-time-tag {
    width: 0.14rem;
    height: 0.14rem;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    // background-image: url(../assets/share_wrap_1.png);
    background-color: red;
  }
  .dialog-time-txt {
    height: 0.18rem;
    line-height: 0.18rem;
  }
}
.task-btn {
  width: 5rem;
  height: 4rem;
  position: absolute;
  bottom: 0.5rem;
  right: 2.8rem;
  cursor: pointer;
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-image: url(../assets/task_btn.png);
}
</style>
