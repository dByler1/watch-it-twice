//triggered when modal is about to be shown
$('#editModal').on('show.bs.modal', function (e) {

    const reviewID = $(e.relatedTarget).data('id');
    const reviewString = $(e.relatedTarget).data('string');
    const rating = $(e.relatedTarget).data('rating');
    const path = window.location.pathname;

    $('#reviewString').val(reviewString);
    $('#rating').val(rating);
    $('#reviewID').val(reviewID);
    $('#editReviewPath').val(path);

});

$('#deleteModal').on('show.bs.modal', function (e) {

    const reviewID = $(e.relatedTarget).data('id');
    const path = window.location.pathname;

    $('#deleteReviewID').val(reviewID);
    $('#deleteReviewPath').val(path);

});