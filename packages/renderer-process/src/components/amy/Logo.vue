<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: number | string;
    color?: string;
    animation?: boolean;
    label?: string;
  }>(),
  {
    size: 36,
    color: '#fff',
    animation: true,
    label: 'AMY Logo',
  },
);

/** size 支持数字（px）或字符串（如 '2rem'），统一转为样式字符串 */
const sizeStyle = computed(() =>
  typeof props.size === 'number' ? `${props.size}px` : props.size,
);

function getAnimationStyle(aniStyle: string) {
  if (!props.animation) return {};
  const sep = aniStyle.indexOf(':');
  if (sep === -1) return {};
  return { [aniStyle.slice(0, sep).trim()]: aniStyle.slice(sep + 1).trim() };
}
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 128 128"
    preserveAspectRatio="xMidYMid"
    role="img"
    :aria-label="label"
    :style="{ '--logo-color': color, width: sizeStyle, height: sizeStyle }"
  >
    <g class="ldl-scale" style="transform-origin: 50% 50%; transform: rotate(0deg) scale(1.2, 1.2)">
      <g class="ldl-ani">
        <g class="ldl-layer">
          <g
            class="ldl-ani"
            style="
              transform-box: view-box;
              opacity: 1;
              transform-origin: 64px 64px;
              transform: matrix3d(0.91, 0, 0, 0, 0, 0.91, 0, 0, 0, 0, 0.91, 0, 0, 0, 0, 1);
            "
            :style="
              getAnimationStyle('animation: 3s linear 0s infinite normal forwards running animate')
            "
          ></g>
        </g>
        <g class="ldl-layer">
          <g
            class="ldl-ani"
            style="
              transform-box: view-box;
              opacity: 1;
              transform-origin: 64px 64px;
              transform: matrix3d(0.91, 0, 0, 0, 0, 0.91, 0, 0, 0, 0, 0.91, 0, 0, 0, 0, 1);
            "
            :style="
              getAnimationStyle(
                'animation: 3s linear -0.3s infinite normal forwards running animate',
              )
            "
          >
            <circle
              r="3.8"
              cy="95.1"
              cx="82.8"
              class="st1"
              style="stroke-width: 1"
            />
          </g>
        </g>
        <g class="ldl-layer">
          <g
            class="ldl-ani"
            style="
              transform-box: view-box;
              opacity: 1;
              transform-origin: 64px 64px;
              transform: matrix3d(0.91, 0, 0, 0, 0, 0.91, 0, 0, 0, 0, 0.91, 0, 0, 0, 0, 1);
            "
            :style="
              getAnimationStyle(
                'animation: 3s linear -0.6s infinite normal forwards running animate',
              )
            "
          >
            <path
              d="M26.6,82H86"
              class="st2"
              style="stroke-width: 3"
              :style="{ stroke: 'var(--logo-color)' }"
            />
          </g>
        </g>
        <g class="ldl-layer">
          <g class="ldl-ani">
            <g>
              <g class="ldl-layer">
                <g class="ldl-ani">
                  <g>
                    <g class="ldl-layer">
                      <g
                        class="ldl-ani"
                        style="
                          transform-box: view-box;
                          opacity: 1;
                          transform-origin: 64px 64px;
                          transform: matrix3d(
                            0.91,
                            0,
                            0,
                            0,
                            0,
                            0.91,
                            0,
                            0,
                            0,
                            0,
                            0.91,
                            0,
                            0,
                            0,
                            0,
                            1
                          );
                        "
                        :style="
                          getAnimationStyle(
                            'animation: 3s linear -0.9s infinite normal forwards running animate',
                          )
                        "
                      >
                        <path
                          d="M72.7,48c0,1.5,0.6,3.1,1.9,4.1l1.9,1.5c0.6,0.5,1.4,1,1.9,1.7c2.3,2.6,5,5.4,7.4,8.6 c1.2,1.7,2.3,3.5,3.2,5.4c0.3,0.5,0.4,1,0.6,1.5c0.1,0.5,0.4,1,0.5,1.5c0.3,1,0.5,2,0.6,3.1c0.3,2.2-0.1,4.5-0.9,6.3 c-0.4,0.9-0.9,1.8-1.4,2.7c-0.5,0.8-0.8,1.7-1.5,2.3c-0.4,0.3-0.9,0.3-1.2,0c-0.1-0.1-0.3-0.4-0.3-0.5c-0.1-1.2,0.4-1.9,0.8-2.8 c0.4-0.9,0.6-1.8,0.9-2.6c0.5-1.7,0.5-3.2,0.1-4.7c-0.9-3.2-2.9-5.9-5.6-8.2c-2.6-2.3-5.8-4.4-8.6-7.3c-0.8-0.8-1.4-1.5-1.8-2.6 c-0.5-1-0.9-2-1.3-3.1c-0.3-1.2-0.5-2.2-0.6-3.3c-0.3-1-0.3-2.2-0.5-3.3c-0.3-1,0.5-2,1.5-2.3c1-0.3,2,0.5,2.3,1.5v0.4L72.7,48 L72.7,48z"
                          class="st1"
                          style="stroke-width: 1"
                        />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g class="ldl-layer">
                <g class="ldl-ani">
                  <g>
                    <g class="ldl-layer">
                      <g
                        class="ldl-ani"
                        style="
                          transform-box: view-box;
                          opacity: 1;
                          transform-origin: 64px 64px;
                          transform: matrix3d(
                            0.91,
                            0,
                            0,
                            0,
                            0,
                            0.91,
                            0,
                            0,
                            0,
                            0,
                            0.91,
                            0,
                            0,
                            0,
                            0,
                            1
                          );
                        "
                        :style="
                          getAnimationStyle(
                            'animation: 3s linear -1.2s infinite normal forwards running animate',
                          )
                        "
                      >
                        <ellipse
                          ry="12.2"
                          rx="18.3"
                          cy="94.8"
                          cx="55.8"
                          class="st1"
                          transform="matrix(0.866 -0.5 0.5 0.866 -39.9331 40.617)"
                          style="stroke-width: 1"
                        />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g class="ldl-layer">
                <g class="ldl-ani">
                  <g>
                    <g class="ldl-layer">
                      <g
                        class="ldl-ani"
                        style="
                          transform-box: view-box;
                          opacity: 1;
                          transform-origin: 64px 64px;
                          transform: matrix3d(
                            0.91,
                            0,
                            0,
                            0,
                            0,
                            0.91,
                            0,
                            0,
                            0,
                            0,
                            0.91,
                            0,
                            0,
                            0,
                            0,
                            1
                          );
                        "
                        :style="
                          getAnimationStyle(
                            'animation: 3s linear -1.5s infinite normal forwards running animate',
                          )
                        "
                      >
                        <path
                          d="M72.7,19.2c0,1.5,0.6,3.1,1.9,4.1l1.9,1.5c0.6,0.5,1.4,1,1.9,1.7c2.3,2.6,5,5.4,7.4,8.6 c1.2,1.7,2.3,3.5,3.2,5.4c0.3,0.5,0.4,1,0.6,1.5c0.1,0.5,0.4,1,0.5,1.5c0.3,1,0.5,2,0.6,3.1c0.3,2.2-0.1,4.5-0.9,6.3 c-0.4,0.9-0.9,1.8-1.4,2.7c-0.5,0.8-0.8,1.7-1.5,2.3c-0.4,0.3-0.9,0.3-1.2,0c-0.1-0.1-0.3-0.4-0.3-0.5c-0.1-1.2,0.4-1.9,0.8-2.8 c0.4-0.9,0.6-1.8,0.9-2.6c0.5-1.7,0.5-3.2,0.1-4.7c-0.9-3.2-2.9-5.9-5.6-8.2c-2.6-2.3-5.8-4.4-8.6-7.3c-0.8-0.8-1.4-1.5-1.8-2.6 c-0.5-1-0.9-2-1.3-3.1c-0.3-1.2-0.5-2.2-0.6-3.3c-0.3-1-0.3-2.2-0.5-3.3c-0.3-1,0.5-2,1.5-2.3c1-0.3,2,0.5,2.3,1.5v0.4 C72.8,19.1,72.7,19.2,72.7,19.2z"
                          class="st1"
                          style="stroke-width: 1"
                        />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
              <g class="ldl-layer">
                <g
                  class="ldl-ani"
                  style="
                    transform-box: view-box;
                    opacity: 1;
                    transform-origin: 64px 64px;
                    transform: matrix3d(0.91, 0, 0, 0, 0, 0.91, 0, 0, 0, 0, 0.91, 0, 0, 0, 0, 1);
                  "
                  :style="
                    getAnimationStyle(
                      'animation: 3s linear -1.8s infinite normal forwards running animate',
                    )
                  "
                >
                  <path
                    d="M70.8,87.9V19.2"
                    class="st3"
                    style="stroke-width: 3"
                  />
                </g>
              </g>
              <g class="ldl-layer">
                <g class="ldl-ani">
                  <g>
                    <g class="ldl-layer">
                      <g
                        class="ldl-ani"
                        style="
                          transform-box: view-box;
                          opacity: 1;
                          transform-origin: 64px 64px;
                          transform: matrix3d(
                            0.91,
                            0,
                            0,
                            0,
                            0,
                            0.91,
                            0,
                            0,
                            0,
                            0,
                            0.91,
                            0,
                            0,
                            0,
                            0,
                            1
                          );
                        "
                        :style="
                          getAnimationStyle(
                            'animation: 3s linear -2.1s infinite normal forwards running animate',
                          )
                        "
                      >
                        <path
                          d="M72.7,33.5c0,1.5,0.6,3.1,1.9,4.1l1.9,1.5c0.6,0.5,1.4,1,1.9,1.7c2.3,2.6,5,5.4,7.4,8.6 c1.2,1.7,2.3,3.5,3.2,5.4c0.3,0.5,0.4,1,0.6,1.5c0.1,0.5,0.4,1,0.5,1.5c0.3,1,0.5,2,0.6,3.1c0.3,2.2-0.1,4.5-0.9,6.3 c-0.4,0.9-0.9,1.8-1.4,2.7c-0.5,0.8-0.8,1.7-1.5,2.3c-0.4,0.3-0.9,0.3-1.2,0c-0.1-0.1-0.3-0.4-0.3-0.5c-0.1-1.2,0.4-1.9,0.8-2.8 c0.4-0.9,0.6-1.8,0.9-2.6c0.5-1.7,0.5-3.2,0.1-4.7c-0.9-3.2-2.9-5.9-5.6-8.2c-2.6-2.3-5.8-4.4-8.6-7.3c-0.8-0.8-1.4-1.5-1.8-2.6 c-0.5-1-0.9-2-1.3-3.1c-0.3-1.2-0.5-2.2-0.6-3.3c-0.3-1-0.3-2.2-0.5-3.3c-0.3-1,0.5-2,1.5-2.3c1-0.3,2,0.5,2.3,1.5v0.4L72.7,33.5z"
                          class="st1"
                          style="stroke-width: 1"
                        />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
        <g class="ldl-layer">
          <g
            class="ldl-ani"
            style="
              transform-box: view-box;
              opacity: 1;
              transform-origin: 64px 64px;
              transform: matrix3d(0.91, 0, 0, 0, 0, 0.91, 0, 0, 0, 0, 0.91, 0, 0, 0, 0, 1);
            "
            :style="
              getAnimationStyle(
                'animation: 3s linear -2.4s infinite normal forwards running animate',
              )
            "
          >
            <path
              d="M26.6,62.8H86"
              class="st2"
              style="stroke-width: 3"
              :style="{ stroke: 'var(--logo-color)' }"
            />
          </g>
        </g>
        <g class="ldl-layer">
          <g
            class="ldl-ani"
            style="
              transform-box: view-box;
              opacity: 1;
              transform-origin: 64px 64px;
              transform: matrix3d(0.91, 0, 0, 0, 0, 0.91, 0, 0, 0, 0, 0.91, 0, 0, 0, 0, 1);
            "
            :style="
              getAnimationStyle(
                'animation: 3s linear -2.7s infinite normal forwards running animate',
              )
            "
          ></g>
        </g>
      </g>
    </g>
  </svg>
</template>

<style lang="scss">
.st0 {
  fill: none;
}
.st1 {
  fill: var(--logo-color);
}
.st2,
.st3 {
  fill: none;
  stroke: var(--logo-color);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-miterlimit: 10;
}
.st3 {
  stroke-linejoin: round;
}

.ldl-ani {
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .ldl-ani {
    animation: none !important;
  }
}

@keyframes animate {
  0.00% {
    transform: translate(0px, 0px) rotate(0deg) scale(0.91, 0.91);
    opacity: 1;
  }
  4.00% {
    transform: translate(0px, 0px) rotate(0deg) scale(0.91, 0.91);
  }
  8.00% {
    animation-timing-function: cubic-bezier(0.69, 0.6, 0.35, 0.27);
    transform: translate(0px, 0px) rotate(0deg) scale(0.91, 0.91);
  }
  14.00% {
    transform: translate(0px, 0px) rotate(0deg) scale(0.93, 0.93);
  }
  18.00% {
    transform: translate(0px, 0px) rotate(0deg) scale(0.94, 0.94);
  }
  22.00% {
    animation-timing-function: cubic-bezier(0.67, 0.66, 0.34, 0.33);
    transform: translate(0px, 0px) rotate(0deg) scale(0.96, 0.96);
  }
  26.00% {
    transform: translate(0px, 0px) rotate(0deg) scale(0.97, 0.97);
  }
  30.00% {
    transform: translate(0px, 0px) rotate(0deg) scale(0.99, 0.99);
  }
  34.00% {
    animation-timing-function: cubic-bezier(0.65, 0.71, 0.32, 0.38);
    transform: translate(0px, 0px) rotate(0deg) scale(1.01, 1.01);
  }
  40.00% {
    animation-timing-function: cubic-bezier(0.64, 0.74, 0.31, 0.41);
    transform: translate(0px, 0px) rotate(0deg) scale(1.02, 1.02);
  }
  46.00% {
    animation-timing-function: cubic-bezier(0.6, 0.91, 0.23, 0.63);
    transform: translate(0px, 0px) rotate(0deg) scale(1.03, 1.03);
  }
  50.00% {
    transform: translate(0px, 0px) rotate(0deg) scale(1.03, 1.03);
  }
  54.00% {
    transform: translate(0px, 0px) rotate(0deg) scale(1.03, 1.03);
  }
  58.00% {
    animation-timing-function: cubic-bezier(0.69, 0.6, 0.35, 0.27);
    transform: translate(0px, 0px) rotate(0deg) scale(1.03, 1.03);
  }
  64.00% {
    transform: translate(0px, 0px) rotate(0deg) scale(1.01, 1.01);
  }
  68.00% {
    transform: translate(0px, 0px) rotate(0deg) scale(1, 1);
  }
  72.00% {
    animation-timing-function: cubic-bezier(0.67, 0.66, 0.34, 0.33);
    transform: translate(0px, 0px) rotate(0deg) scale(0.98, 0.98);
  }
  76.00% {
    animation-timing-function: cubic-bezier(0.66, 0.68, 0.33, 0.35);
    transform: translate(0px, 0px) rotate(0deg) scale(0.97, 0.97);
  }
  82.00% {
    animation-timing-function: cubic-bezier(0.65, 0.71, 0.32, 0.38);
    transform: translate(0px, 0px) rotate(0deg) scale(0.94, 0.94);
  }
  88.00% {
    animation-timing-function: cubic-bezier(0.65, 0.73, 0.31, 0.4);
    transform: translate(0px, 0px) rotate(0deg) scale(0.92, 0.92);
  }
  94.00% {
    animation-timing-function: cubic-bezier(0.63, 0.8, 0.28, 0.48);
    transform: translate(0px, 0px) rotate(0deg) scale(0.91, 0.91);
  }
  100.00% {
    animation-timing-function: cubic-bezier(0.63, 0.8, 0.28, 0.48);
    transform: translate(0px, 0px) rotate(0deg) scale(0.91, 0.91);
  }
}
</style>
