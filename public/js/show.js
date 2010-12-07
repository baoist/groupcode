$(function() {
  $('a#create_project').click(function() {
    var tar = $('.createproj')
    if($(tar).attr('id') != 'open') {
      $(tar).stop()
        .slideDown(300)
        .attr('id', 'open');
    } else {
      $(tar)
        .stop().slideUp(300)
        .attr('id', 'closed');
    }

    return false;
  })
})
