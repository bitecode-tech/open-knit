package bitecode.modules.auth.user.repository;

import bitecode.modules.auth.user.model.data.FindUsersCriteria;
import bitecode.modules.auth.user.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.ModelAttribute;

public interface CustomUserRepository {
    Page<User> findAllByCriteria(Pageable pageable, @ModelAttribute FindUsersCriteria userCriteria);
}
