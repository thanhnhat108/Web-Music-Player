const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const player = $('.player')
const cd = $('.cd')
const heading =  $('header h2')
const cdThumb =  $('.cd .cd-thumb')
const audio =  $('#audio')
const playBtn = $('.btn-toggle-play')
const proGress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const playlist = $('.playlist')

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER'




const app = {
    currentIndex: 1,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Crying Shame',
            singer: 'Pegboard Nerds',
            path: './assets/music/Crying Shame-Pegboard Nerds.mp3',
            image: './assets/img/cryingshame.jpg'
        },
        {
            name: 'Fairy Tail Opening 15',
            singer: 'Fairy Tail',
            path: './assets/music/FairyTail Opening 15.mp3',
            image: './assets/img/fairytail.jpg'
        },
        {
            name: 'HoriMiya Opening',
            singer: 'horimiya',
            path: './assets/music/Horimiya.mp3',
            image: './assets/img/horimiya.jpg'
        },
        {
            name: 'Ngẫu Hứng',
            singer: 'HOAPROX',
            path: './assets/music/NgauHung-HOAPROX.mp3',
            image: './assets/img/ngauhung.jpg'
        },
        {
            name: 'ThrowBack',
            singer: 'Electro Light',
            path: './assets/music/Throwback-ElectroLight.mp3',
            image: './assets/img/throwback.jpg'
        },
        {
            name: 'Everything Goes On',
            singer: 'Porter Robinson',
            path: './assets/music/EverythingGoesOn-PorterRobinson.mp3',
            image: './assets/img/EverythingGoesOn.jpg'
        },
        {
            name: 'This Far',
            singer: 'RavenKreyn ft NinoLucarelli',
            path: './assets/music/ThisFar-RavenKreyn+NinoLucarelli.mp3',
            image: './assets/img/thisfar.jpg'
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    render: function(){
        const htmls = this.songs.map( (song, index)=> {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-id="${index}">
                    <div class="thumb" style="background-image: url(${song.image})">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
        
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function(){
        const _this = this
        const cdWidth = cd.offsetWidth

        // Handle rotae cd
        const cdThumbAnimate =  cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 15000, // 10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // scoll list song
        document.onscroll = function(){
            const scrollTop = window.scrollY
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth>0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Play / Pause song when click
        playBtn.onclick = function(){
            if (_this.isPlaying){
                audio.pause()
            } else {
                audio.play()
            }
        }

        // when song play/pause, button change
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()

        }

        // when the current playback position has changed 
        audio.ontimeupdate = function(){
            if (audio.duration){
                const percent = Math.floor((audio.currentTime / audio.duration) * 100) 
                proGress.value = percent
                proGress.style.backgroundSize = (percent - proGress.min) * 100 / (proGress.max - proGress.min) + '% 100%'
            }
            
        }

        // Rewind song
        proGress.onchange = function(e){
            const seekTime = (proGress.value * audio.duration) / 100
            audio.currentTime = seekTime
        }

        // Prev song
        prevBtn.onclick = function(){
            if (_this.isRandom){
                _this.RandomSong()
            } else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scorllToActiveSong()
        }

        // Next song
        nextBtn.onclick = function(){
            if (_this.isRandom){
                _this.RandomSong()
            } else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scorllToActiveSong()
        }

        // Toggle button random song
        randomBtn.onclick = function(){
           _this.isRandom = ! _this.isRandom
           _this.setConfig('isRandom', _this.isRandom)
           randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Toggle button repeat song
        repeatBtn.onclick = function(){
            _this.isRepeat = ! _this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        //Next song when audio ended
        audio.onended = function(){
            if (_this.isRepeat){
                audio.play()
            } else{
                nextBtn.click()
            }
        }    

        // Listen event click on playlist
        playlist.onclick = function(e){
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option') ){
                // Handle click on song
                if (songNode) {
                    _this.currentIndex = parseInt(songNode.getAttribute('data-id'))
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                // Handle click on btn option
                if (e.target.closest('.option')) {
                    console.log(1);
                }
            }
        }

    },

    scorllToActiveSong: function(){
        setTimeout(() =>{
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: "center",
            })
        }, 500)
    },

    loadCurrentSong: function(){
        heading.innerText = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.setAttribute('src', `${this.currentSong.path}`)
        this.setConfig('currentSong', this.currentSong)
        this.setConfig('currentIndex', this.currentIndex)
    },

    loadConfig: function(){
        this.isRandom = this.config['isRandom']
        this.isRepeat = this.config['isRepeat']
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)

        this.currentSong = this.config['currentSong']
        this.currentIndex = this.config['currentIndex']
       
    },

    RandomSong: function(){
        
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex == this.currentIndex);

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    prevSong: function(){
        this.currentIndex -- 
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        console.log(this.currentIndex);
        this.loadCurrentSong()
    },
     
    nextSong: function(){
        this.currentIndex++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong() 
    },
    

    start: function(){
        this.loadConfig()

        this.defineProperties()

        this.handleEvents()

        this.loadCurrentSong()

        this.render()
  
    }
}

app.start()