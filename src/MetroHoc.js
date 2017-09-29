import React from 'react'
import { TweenMax } from 'gsap'

const MetroHoc = Component =>
  class MetroContainer extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        animating: false
      }
    }

    // longest animation in sequence
    getLongestAnimationInSequence(io) {
      return Math.max(
        ...this.props.sequence.map(
          obj => obj.animation[io].time + obj.animation[io].delay
        )
      )
    }

    isThisTheLongestAnimation(animation, io) {
      const highestDuration = this.getLongestAnimationInSequence(io)
      const duration = animation[io].time + animation[io].delay
      return duration >= highestDuration
    }

    applySequenceEndIfLastInSequence(animationIndex, sequence, io) {
      const highestDuration = this.getLongestAnimationInSequence(io)
      let isLastInSequence = true
      sequence.forEach((animationInSequence, i) => {
        const duration =
          animationInSequence.animation[io].time +
          animationInSequence.animation[io].delay
        if (duration === highestDuration) {
          if (i > animationIndex) {
            isLastInSequence = false
          }
        }
      })
      return isLastInSequence
    }

    // on will enter
    componentWillEnter(callback) {
      const el = this.container

      this.setState({ animating: true })
      TweenMax.fromTo(
        el,
        this.props.animation.in.time,
        this.props.animation.willEnter.from,
        {
          ...this.props.animation.willEnter.to,
          delay: this.props.animation.in.delay,
          onComplete: () => {
            if (
              this.isThisTheLongestAnimation(this.props.animation, 'in') &&
              this.applySequenceEndIfLastInSequence(
                this.props.index,
                this.props.sequence,
                'in'
              )
            ) {
              this.setState({ animating: false })
              this.props.onMount && this.props.onMount()
            }
            callback()
          }
        }
      )
    }

    // on will leave
    componentWillLeave(callback) {
      const el = this.container
      const fullSequenceDuration = this.getLongestAnimationInSequence('out')

      const leftOver =
        fullSequenceDuration -
        (this.props.animation.out.time + this.props.animation.out.delay)

      this.setState({ animating: true })
      TweenMax.fromTo(
        el,
        this.props.animation.out.time,
        this.props.animation.willLeave.from,
        {
          ...this.props.animation.willLeave.to,
          delay: this.props.animation.out.delay,
          onComplete: () => {
            setTimeout(() => {
              if (
                this.isThisTheLongestAnimation(this.props.animation, 'out') &&
                this.applySequenceEndIfLastInSequence(
                  this.props.index,
                  this.props.sequence,
                  'out'
                )
              ) {
                this.setState({ animating: false })
                this.props.onUnmount && this.props.onUnmount()
              }
              callback()
            }, leftOver * 1000)
          }
        }
      )
    }

    /* eslint-disable */
    render() {
      return this.props.wrapperType ? (
        <this.props.wrapperType ref={c => (this.container = c)}>
          <Component {...this.props} />
        </this.props.wrapperType>
      ) : (
        <div ref={c => (this.container = c)}>
          <Component {...this.props} animating={this.state.animating} />
        </div>
      )
    }
  }

export default MetroHoc
