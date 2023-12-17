package com.example.odap.repository;

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
public class VoiceDataRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    private final AtomicLong idCounter = new AtomicLong(30);

    private RowMapper<VoiceData> rowMapper = (rs, rowNum) -> {
        VoiceData voiceData = new VoiceData();
        voiceData.setId(rs.getLong("id"));
        voiceData.setDatasetId(rs.getLong("dataset_id"));
        voiceData.setName(rs.getString("name"));
        voiceData.setFilePath(rs.getString("file_path"));
        return voiceData;
    };

    public Page<VoiceData> findByDatasetId(Long datasetId, Pageable pageable) {
        String sql = "SELECT * FROM voice_data  WHERE dataset_id = ? LIMIT ? OFFSET ?";
        List<VoiceData> voiceDataList = jdbcTemplate.query(
                sql,
                new Object[]{datasetId, pageable.getPageSize(), pageable.getOffset()},
                rowMapper
        );

        String countSql = "SELECT COUNT(*) FROM voice_data WHERE dataset_id = ?";
        int total = jdbcTemplate.queryForObject(countSql, new Object[]{datasetId}, Integer.class);

        return new PageImpl<>(voiceDataList, pageable, total);
    }

    public VoiceData findByDatasetIdAndId(Long datasetId, Long id) {
        String sql = "SELECT * FROM voice_data  WHERE dataset_id = ? AND id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{datasetId, id}, rowMapper);
    }

    public int countByDatasetId(Long datasetId) {
        String sql = "SELECT COUNT(*) FROM voice_data  WHERE dataset_id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{datasetId}, Integer.class);
    }

    public VoiceData save(VoiceData voiceData) {
        long uniqueID = idCounter.incrementAndGet();
        voiceData.setId(uniqueID);
            String sql = "INSERT INTO voice_data  (id,dataset_id, name, file_path) VALUES (?,?, ?, ?)";
            jdbcTemplate.update(sql, voiceData.getId(),voiceData.getDatasetId(), voiceData.getName(), voiceData.getFilePath());

        return voiceData;
    }
}
