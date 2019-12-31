//triggered when modal is about to be shown
$('#editModal').on('show.bs.modal', function (e) {

    const reviewID = $(e.relatedTarget).data('id');
    const reviewString = $(e.relatedTarget).data('string');
    const rating = $(e.relatedTarget).data('rating');

    $('#reviewString').val(reviewString);
    $('#rating').val(rating);
    $('#reviewID').val(reviewID);

});

$('#deleteModal').on('show.bs.modal', function (e) {

    const reviewID = $(e.relatedTarget).data('id');

    $('#deleteReviewID').val(reviewID);

});