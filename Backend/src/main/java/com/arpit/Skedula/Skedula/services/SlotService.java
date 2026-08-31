package com.arpit.Skedula.Skedula.services;

import com.arpit.Skedula.Skedula.dto.SlotDTO;

import java.time.LocalDate;
import java.util.List;

public interface SlotService {
    List<SlotDTO> getAvailableSlots(Long serviceId, LocalDate date);
}
