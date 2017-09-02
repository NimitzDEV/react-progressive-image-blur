import React from 'react'
import { boxBlurImage } from './superfastblur'

const inlineStyleWrapper = {
  position: 'relative',
  overflow: 'hidden'
}

const inlineStyleCanvas = {
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 2
}

// the first value always will be the thumbnail
// the last value will always be the original file
const defaultImgResolution = {
  50: '-w50',
  200: '-w200',
  630: '-w630',
  1180: '-o'
}

let customImgResolutions = null

/**
 * React Lazy Progressive Image Loader
 *
 * @export
 * @class DeferImg
 * @extends {React.Component}
 */
export class DeferImg extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      resolutions:
        props.resolutions || customImgResolutions || defaultImgResolution,
      fileinfo: {
        ready: false,
        filename: '',
        urlParams: '',
        filepath: '',
        extention: ''
      },
      canLoad: false,
      finished: false,
      loadHd: false,
      blurRelay: 60,
      scrollEventListener: null
    }

    this.eventListener = false
    this.debounceTimer = null
    this.debounceCalled = false

    this.shouldLoadDetectDebounce = this.shouldLoadDetectDebounce.bind(this)
    this.debounceFinished = this.debounceFinished.bind(this)
  }

  componentDidMount() {
    this.setFileInfo(this.props.src)
    this.setElementId()
  }

  componentWillUnmount() {
    if (this.eventListener) this.unregisterScrollListener()
    if (this.debounceTimer) clearTimeout(this.debounceTimer)
  }

  registerScrollListener() {
    this.eventListener = true
    window.addEventListener('scroll', this.shouldLoadDetectDebounce, true)
  }

  unregisterScrollListener() {
    if (!this.eventListener) return
    window.removeEventListener('scroll', this.shouldLoadDetectDebounce, true)
    this.eventListener = false
  }

  debounceFinished() {
    clearTimeout(this.debounceTimer)
    this.debounceTimer = null
    this.debounceCalled = false
    this.shouldLoad()
  }

  shouldLoadDetectDebounce() {
    if (this.debounceTimer || this.debounceCalled) return
    this.debounceCalled = true
    this.debounceTimer = setTimeout(this.debounceFinished, 300)
  }

  /**
   * Concat specific resolution image
   *
   * @param {any} [{ thumb, width }={}]
   * @returns {string} Image source string
   * @memberof DeferImg
   */
  haveImage({ thumb } = {}) {
    if (thumb) {
      return this.filenameConcat({
        resolution: Math.min.apply(null, Object.keys(this.state.resolutions))
      })
    }
    let width = document.getElementById(this.state.idImgHolder).offsetWidth
    // If the width is fit just right in
    // use it immediatly
    if (this.state.resolutions[width])
      return this.filenameConcat({
        resolution: this.state.resolutions[width]
      })

    // Or calculate the 'distant' list to find out
    // which resolution is better for current width
    let nearest = Object.keys(this.state.resolutions)
      .map(r => ({
        k: r,
        dist: Math.abs(width - r)
      }))
      .sort((prev, next) => prev.dist - next.dist)
      .shift()
    return this.filenameConcat({
      resolution: nearest.k
    })
  }

  /**
   * Concat source string
   *
   * @param {any} { resolution }
   * @returns
   * @memberof DeferImg
   */
  filenameConcat({ resolution }) {
    return (
      this.state.fileinfo.filepath +
      this.state.fileinfo.filename +
      this.state.resolutions[resolution] +
      this.state.fileinfo.extention +
      this.state.fileinfo.urlParams
    )
  }

  /**
   * Call boxBlurImage to blur the thumb/given image source
   *
   * @param {any} [{ radius, iteration = 1, source }={}]
   * @memberof DeferImg
   */
  blurImg({ radius, iteration = 1, source } = {}) {
    boxBlurImage(
      source || this.state.idLowResImgHolder,
      this.state.idBlurCanvas,
      radius,
      false,
      iteration
    )
  }

  /**
   * Image blur animation function
   *
   * @param {any} { start }
   * @param {function} callback Callback function for animation
   * @memberof DeferImg
   */
  blurAnimation({ amount, source } = {}, callback) {
    let relay = this.state.blurRelay
    let finishPoint = relay - amount <= 0 ? 0 : relay - amount

    let timer = setInterval(() => {
      if (relay <= finishPoint) {
        clearInterval(timer)
        callback && callback({ finishPoint })
        return
      }
      this.blurImg({ radius: relay, source })
      relay -= 10
    }, 10)

    this.setState({ blurRelay: finishPoint })
  }

  /**
   * Sets the ids for image andcavas
   *
   * @memberof DeferImg
   */
  setElementId() {
    let idSuffix = Date.now() + '.' + Math.random()
    this.setState(
      {
        idLowResImgHolder: 'img-lr-' + idSuffix,
        idBlurCanvas: 'canvas-blur-' + idSuffix,
        idHdImgHolder: 'img-hd-' + idSuffix,
        idImgHolder: 'img-container-' + idSuffix
      },
      () => {
        if (!this.shouldLoad()) this.registerScrollListener()
      }
    )
  }

  /**
   * Sets the image source info
   *
   * @param {any} fn Image source
   * @memberof DeferImg
   */
  setFileInfo(fn) {
    let regexUrlParams = (regexUrlParams = /(\?|\&)([^=]+)\=([^&]+)/g)
    let cleanUrl = fn.replace(regexUrlParams, '')

    let urlParamsMatchResult = fn.match(regexUrlParams)
    let urlParams = (urlParamsMatchResult && urlParamsMatchResult.pop()) || ''

    let filename = cleanUrl.split('/').pop()
    let filepath = fn.replace(filename, '')

    filename = filename.split('.').shift()
    let extention = '.' + cleanUrl.split('.').pop()

    this.setState({
      fileinfo: { ready: true, urlParams, filename, filepath, extention }
    })
  }

  /**
   * Detect if current image element is in viewport
   * and then start load it immediatly
   *
   * @memberof DeferImg
   */
  shouldLoad() {
    let img = document.getElementById(this.state.idImgHolder)
    let bound = img.getBoundingClientRect()
    let docHeight = window.screen.height
    let canLoad = bound.top >= 0 && bound.top <= docHeight
    this.setState({ canLoad })
    return canLoad
  }

  // After thumb loaded, start to load hd version
  switchToHd() {
    this.blurAnimation({ amount: 40 }, () => {
      setTimeout(() => {
        this.setState({ loadHd: true })
      }, 800)
    })
  }

  // After hd version finish loading
  // clear the canvas and thumb image
  loadHdFinished() {
    this.blurAnimation(
      {
        amount: 20,
        source: this.state.idHdImgHolder
      },
      () => {
        this.setState({ finished: true })
      }
    )
  }

  render() {
    if (!this.state.fileinfo.ready || !this.state.canLoad)
      return <div id={this.state.idImgHolder} style={inlineStyleWrapper} />
    return (
      <div
        className={this.props.className}
        id={this.state.idImgHolder}
        style={inlineStyleWrapper}
      >
        {this.state.loadHd ? (
          <img
            alt={this.props.alt}
            id={this.state.idHdImgHolder}
            src={this.haveImage({ thumb: false })}
            onLoad={() => {
              this.loadHdFinished()
            }}
            style={{ opacity: this.state.finished ? 1 : 0 }}
          />
        ) : (
          <img
            alt={this.props.alt}
            id={this.state.idLowResImgHolder}
            src={this.haveImage({ thumb: true })}
            onLoad={() => {
              this.switchToHd()
              this.unregisterScrollListener()
            }}
            style={{ opacity: this.state.loadHd ? 1 : 0 }}
          />
        )}
        {this.state.finished ? null : (
          <canvas id={this.state.idBlurCanvas} style={inlineStyleCanvas} />
        )}
        {this.props.figcaption ? (
          <figcaption>{this.props.figcaption}</figcaption>
        ) : null}
      </div>
    )
  }
}

export function DeferImgGlobalSettings({ resolutions }) {
  customImgResolutions = (resolutions && Object.assign({}, resolutions)) || null
  return true
}
