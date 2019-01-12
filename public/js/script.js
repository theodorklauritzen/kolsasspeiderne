$(document).ready(function() {
    let docHeight = $(window).height()
    let footer = $('.footer')
    let footerHeight = footer.height() + parseInt(footer.css('paddingTop')) + parseInt(footer.css('paddingBottom'))
    let footerTop = $('.footer').position().top + footerHeight

    if (footerTop < docHeight)
        $('.footer').css('margin-top', (docHeight - footerTop - 1) + 'px')
});
