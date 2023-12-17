package com.example.odap.repository;

import com.example.odap.entity.PictureData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.odap.entity.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class UserRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    private final AtomicLong idCounter = new AtomicLong(10);

    private RowMapper<User> rowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setUserName(rs.getString("username"));
        user.setPassWord(rs.getString("password"));
        user.setSalt(rs.getString("salt"));
        return user;
    };

    public User save(User user) {
        long uniqueID = idCounter.incrementAndGet();
        user.setId(uniqueID);
            String sql = "INSERT INTO user (id,username, password,salt) VALUES (?,?, ?,?)";
            jdbcTemplate.update(sql,user.getId(), user.getUserName(), user.getPassWord(),user.getSalt());

        return user;
    }

    public User findByUserName(String userName) {
        String sql = "SELECT * FROM user WHERE username = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{userName}, rowMapper);
    }

    public boolean existsByUserName(String userName) {
        String sql = "SELECT COUNT(*) FROM user WHERE username = ?";
        int count = jdbcTemplate.queryForObject(sql, new Object[]{userName}, Integer.class);
        return count > 0;
    }

    public Page<User> findAll(Pageable pageable) {
        String sql = "SELECT * FROM user LIMIT ? OFFSET ?";
        List<User> users = jdbcTemplate.query(
                sql,
                new Object[]{pageable.getPageSize(), pageable.getOffset()},
                rowMapper
        );

        String countSql = "SELECT COUNT(*) FROM user";
        int total = jdbcTemplate.queryForObject(countSql, Integer.class);

        return new PageImpl<>(users, pageable, total);
    }
    public List<User> findAll() {
        String sql = "SELECT * FROM user";
        return jdbcTemplate.query(sql, rowMapper);
    }
    public void delete(User delUser) {
        String sql = "DELETE FROM user WHERE id = ?";
        jdbcTemplate.update(sql, delUser.getId());
    }


}
