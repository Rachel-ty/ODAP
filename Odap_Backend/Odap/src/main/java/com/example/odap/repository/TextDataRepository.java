package com.example.odap.repository;

import com.example.odap.entity.TextData;
import com.example.odap.entity.VoiceData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class TextDataRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    private final AtomicLong idCounter = new AtomicLong(50);

    private RowMapper<TextData> rowMapper = (rs, rowNum) -> {
        TextData textData = new TextData();
        textData.setId(rs.getLong("id"));
        textData.setDatasetId(rs.getLong("dataset_id"));
        textData.setContent(rs.getString("content"));
        return textData;
    };

    public Page<TextData> findByDatasetId(Long datasetId, Pageable pageable) {
        String sql = "SELECT * FROM text_data WHERE dataset_id = ? LIMIT ? OFFSET ?";
        List<TextData> textDataList = jdbcTemplate.query(
                sql,
                new Object[]{datasetId, pageable.getPageSize(), pageable.getOffset()},
                rowMapper
        );

        String countSql = "SELECT COUNT(*) FROM text_data WHERE dataset_id = ?";
        int total = jdbcTemplate.queryForObject(countSql, new Object[]{datasetId}, Integer.class);

        return new PageImpl<>(textDataList, pageable, total);
    }

    public TextData findByDatasetIdAndId(Long datasetId, Long id) {
        String sql = "SELECT * FROM text_data WHERE dataset_id = ? AND id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{datasetId, id}, rowMapper);
    }

    public int countByDatasetId(Long datasetId) {
        String sql = "SELECT COUNT(*) FROM text_data WHERE dataset_id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{datasetId}, Integer.class);
    }

    public TextData save(TextData textData) {
        long uniqueID = idCounter.incrementAndGet();
        textData.setId(uniqueID);
            String sql = "INSERT INTO text_data (id, dataset_id, content) VALUES (?,?, ?)";
            jdbcTemplate.update(sql, textData.getId(),textData.getDatasetId(), textData.getContent());

        return textData;
    }
}
