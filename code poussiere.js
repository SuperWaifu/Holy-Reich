document.addEventListener('DOMContentLoaded', () => {

	document.querySelectorAll('.dot').forEach(dot => {
		dot.addEventListener('click', () => {
			const targetId = dot.getAttribute('data-target');
			document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
		});
	});

});