package com.arpit.Skedula.Skedula.services.Implementation;

import com.arpit.Skedula.Skedula.dto.BusinessReviewSummaryDTO;
import com.arpit.Skedula.Skedula.dto.RequestReviewDTO;
import com.arpit.Skedula.Skedula.dto.ResponseReviewDTO;
import com.arpit.Skedula.Skedula.entity.Appointment;
import com.arpit.Skedula.Skedula.entity.Customer;
import com.arpit.Skedula.Skedula.entity.Review;
import com.arpit.Skedula.Skedula.entity.User;
import com.arpit.Skedula.Skedula.entity.enums.AppointmentStatus;
import com.arpit.Skedula.Skedula.exceptions.ResourceNotFoundException;
import com.arpit.Skedula.Skedula.repository.AppointmentRepository;
import com.arpit.Skedula.Skedula.repository.CustomerRepository;
import com.arpit.Skedula.Skedula.repository.ReviewRepository;
import com.arpit.Skedula.Skedula.repository.UserRepository;
import com.arpit.Skedula.Skedula.services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public ResponseReviewDTO createReview(RequestReviewDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        Customer customer = customerRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer record not found for user: " + email));

        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + request.getAppointmentId()));

        if (!appointment.getBookedBy().getId().equals(customer.getId())) {
            throw new RuntimeException("Unauthorized: You can only review appointments you personally booked.");
        }

        if (appointment.getAppointmentStatus() != AppointmentStatus.DONE) {
            throw new RuntimeException("Reviews are only permitted for completed appointments (status: DONE).");
        }

        if (reviewRepository.existsByAppointment_Id(appointment.getId())) {
            throw new RuntimeException("This appointment has already been reviewed.");
        }

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be an integer between 1 and 5.");
        }

        Review review = Review.builder()
                .customer(customer)
                .business(appointment.getBusiness())
                .service(appointment.getServiceOffered())
                .appointment(appointment)
                .rating(request.getRating())
                .comment(request.getComment() != null ? request.getComment().trim() : "")
                .build();

        Review saved = reviewRepository.save(review);

        return ResponseReviewDTO.builder()
                .id(saved.getId())
                .customerName(customer.getUser() != null ? customer.getUser().getName() : "Verified Customer")
                .serviceName(appointment.getServiceOffered() != null ? appointment.getServiceOffered().getName() : "")
                .rating(saved.getRating())
                .comment(saved.getComment())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessReviewSummaryDTO getReviewsByBusiness(Long businessId) {
        List<Review> reviews = reviewRepository.findByBusiness_IdOrderByCreatedAtDesc(businessId);
        Double avgRating = reviewRepository.getAverageRatingByBusinessId(businessId);
        Long count = reviewRepository.countByBusiness_Id(businessId);

        List<ResponseReviewDTO> dtos = reviews.stream().map(r -> ResponseReviewDTO.builder()
                .id(r.getId())
                .customerName(r.getCustomer() != null && r.getCustomer().getUser() != null
                        ? r.getCustomer().getUser().getName()
                        : "Verified Guest")
                .serviceName(r.getService() != null ? r.getService().getName() : "")
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build()
        ).collect(Collectors.toList());

        return BusinessReviewSummaryDTO.builder()
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .totalReviews(count != null ? count : 0L)
                .reviews(dtos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseReviewDTO getReviewByAppointment(Long appointmentId) {
        return reviewRepository.findByAppointment_Id(appointmentId)
                .map(r -> ResponseReviewDTO.builder()
                        .id(r.getId())
                        .customerName(r.getCustomer() != null && r.getCustomer().getUser() != null ? r.getCustomer().getUser().getName() : "Verified Customer")
                        .serviceName(r.getService() != null ? r.getService().getName() : "")
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .createdAt(r.getCreatedAt())
                        .build())
                .orElse(null);
    }
}
