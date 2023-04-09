const search = document.querySelector('.commands__search')
const items = document.querySelectorAll('.commands__item')
const menuSections = document.querySelectorAll('.commands__section')
const menuTabs = document.querySelectorAll('.commands__btn')
const accordion = document.querySelector('.commands__item-info')
const accordionBtns = document.querySelectorAll('.commands__item-btn')
const timesIcon = document.querySelector('.commands__search-icon-box .fa-times')
const searchIcon = document.querySelector('.commands__search-icon-box .fa-search')
const error = document.querySelector('.commands__error')

const searchEngine = (e) => {

    const text = e.target.value.toLowerCase();

    items.forEach(el => {

        if (el.textContent.toLowerCase().indexOf(text) !== -1) {
            el.style.display = 'block'
            el.classList.add('item-active')
        } else {
			el.style.display = 'none'
            el.classList.remove('item-active')
        }
    });

	if (text !== '') {
		timesIcon.style.display = 'block'
		searchIcon.style.display = 'none'
	}

	if (text === '') {
		timesIcon.style.display = 'none'
		searchIcon.style.display = 'block'
	}

	let activeItems = document.querySelectorAll('.item-active')

	if(activeItems.length == 0) {
		error.style.display = 'block'
	} else {
		error.style.display = 'none'
	}
}

const searchReset = () => {
	search.value = ''
	items.forEach(el => el.style.display = 'block')
	timesIcon.style.display = 'none'
	searchIcon.style.display = 'block'
	error.style.display = 'none'
}

const showInfo = id => {
	menuSections.forEach(section => (section.style.display = 'none'))
	menuTabs.forEach(tab => tab.classList.remove('commands__btn--active'))

	document.getElementById(id).style.display = 'block'

	const currentActiveButton = document.querySelector(`[data-id=${id}`)
	currentActiveButton.classList.add('commands__btn--active')
}

function openAccordionItems() {
	if (this.nextElementSibling.classList.contains('active')) {
		this.nextElementSibling.classList.remove('active')
	} else {
		closeAccordionItems()
		this.nextElementSibling.classList.toggle('active')
	}
}

const closeAccordionItems = () => {
	const allActiveItems = document.querySelectorAll('.commands__item-info')
	allActiveItems.forEach(item => item.classList.remove('active'))
}

const clickOutsideAccordion = e => {
	if (
		e.target.classList.contains('commands__item') || e.target.classList.contains('commands__item-btn') || e.target.classList.contains('commands__item-info') || e.target.classList.contains('commands__item-info-text')
	) {
		return
	} else {
		closeAccordionItems()
	}
}

accordionBtns.forEach(btn => btn.addEventListener('click', openAccordionItems))
window.addEventListener('click', clickOutsideAccordion)
search.addEventListener('keyup', searchEngine)
timesIcon.addEventListener('click', searchReset)