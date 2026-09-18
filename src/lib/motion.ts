import type { RefObject } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP, Flip)
// [data-pop] 같은 선택자는 화면에 따라 없을 수 있다 — 없는 게 정상이므로 경고를 끈다.
gsap.config({ nullTargetWarn: false })

export { gsap, Flip, useGSAP }

const MOTION_OK = '(prefers-reduced-motion: no-preference)'

export function motionOk(): boolean {
  return window.matchMedia(MOTION_OK).matches
}

/** scope 안의 [data-stagger] 요소를 순서대로 등장시킨다. 화면당 한 번의 로드 시퀀스. */
export function useStagger(scope: RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useGSAP(
    () => {
      if (!motionOk()) return
      // 항목이 많아도 전체 등장은 0.5초 안에 끝나게 간격을 줄인다(26개 목록이 0.9초씩 걸리지 않도록).
      const count = scope.current?.querySelectorAll('[data-stagger]').length ?? 0
      gsap.from('[data-stagger]', {
        y: 14,
        autoAlpha: 0,
        duration: 0.45,
        ease: 'power3.out',
        stagger: Math.min(0.035, 0.5 / Math.max(count, 1)),
        clearProps: 'transform,opacity,visibility',
      })
      gsap.from('[data-pop]', {
        scale: 0.4,
        rotate: -12,
        duration: 0.7,
        ease: 'back.out(2.2)',
        stagger: 0.08,
        delay: 0.15,
        clearProps: 'transform',
      })
    },
    { scope, dependencies: deps, revertOnUpdate: true },
  )
}

/** 숫자를 0에서 value까지 센다. 최종 텍스트는 React가 렌더한 값과 같다. */
export function useCountUp(ref: RefObject<HTMLElement | null>, value: number) {
  useGSAP(
    () => {
      const el = ref.current
      if (!el || !motionOk()) return
      const counter = { v: 0 }
      gsap.to(counter, {
        v: value,
        duration: 0.9,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = String(Math.round(counter.v))
        },
      })
    },
    { dependencies: [value] },
  )
}

/** 사용자의 탭에 답하는 작은 팝 */
export function pop(target: Element | null) {
  if (!target || !motionOk()) return
  gsap.fromTo(target, { scale: 0.6 }, { scale: 1, duration: 0.45, ease: 'back.out(3)', clearProps: 'transform' })
}
