const navMobile = document.querySelector('.navbar__mobile')
const navBtn = document.querySelector('.hamburger')
const footerYear = document.querySelector('.footer__year')
const btn = document.querySelector('.scroll-to-top')
const navItems = document.querySelectorAll('.navbar__item')
let root = document.documentElement

const handleScrollBar = () => {
	const scroll = window.scrollY
	const leftToScroll = document.body.getBoundingClientRect().height - window.innerHeight
	const scrollBarWidth = Math.floor((scroll / leftToScroll) * 100)

	root.style.setProperty('--scroll-width', `${scrollBarWidth}%`)

	if (scrollBarWidth > 95) {
		btn.classList.add('active')
	} else {
		btn.classList.remove('active')
	}
}

const scrollToTop = () => {
	window.scroll({
		top: 0,
		behavior: 'smooth',
	})
}

const handleNav = () => {
	navBtn.classList.toggle('is-active')
	navMobile.classList.toggle('navbar__mobile--active')
}



const handleCurrentYear = () => {
	const year = new Date().getFullYear()
	footerYear.innerText = year
}

handleCurrentYear()
navItems.forEach(navItem => navItem.addEventListener('click', handleNav))
navBtn.addEventListener('click', handleNav)
window.addEventListener('scroll', handleScrollBar)
btn.addEventListener('click', scrollToTop)
