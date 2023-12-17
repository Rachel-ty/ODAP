package com.example.odap.repository;

import com.example.odap.entity.Dataset;
import com.example.odap.entity.PictureData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class PictureDataRepository{
    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final AtomicLong idCounter = new AtomicLong(20);

    private RowMapper<PictureData> rowMapper = (rs, rowNum) -> {
        PictureData pictureData = new PictureData();
        pictureData.setId(rs.getLong("id"));
        pictureData.setDatasetId(rs.getLong("dataset_id"));
        pictureData.setName(rs.getString("name"));
        pictureData.setFilePath(rs.getString("file_path"));
        return pictureData;
    };

    public Page<PictureData> findByDatasetId(Long datasetId, Pageable pageable) {
        String sql = "SELECT * FROM  picture_data  WHERE dataset_id = ? LIMIT ? OFFSET ?";
        List<PictureData> pictureDataList = jdbcTemplate.query(
                sql,
                new Object[]{datasetId, pageable.getPageSize(), pageable.getOffset()},
                rowMapper
        );

        String countSql = "SELECT COUNT(*) FROM  picture_data  WHERE dataset_id = ?";
        int total = jdbcTemplate.queryForObject(countSql, new Object[]{datasetId}, Integer.class);

        return new PageImpl<>(pictureDataList, pageable, total);
    }

    public PictureData findByDatasetIdAndId(Long datasetId, Long id) {
        String sql = "SELECT * FROM  picture_data  WHERE dataset_id = ? AND id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{datasetId, id}, rowMapper);
    }

    public int countByDatasetId(Long datasetId) {
        String sql = "SELECT COUNT(*) FROM  picture_data  WHERE dataset_id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{datasetId}, Integer.class);
    }
    public PictureData save(PictureData pictureData) {
        long uniqueID = idCounter.incrementAndGet();
        pictureData.setId(uniqueID);
            String sql = "INSERT INTO  picture_data  (id,dataset_id, name, file_path) VALUES (?,?, ?, ?)";
            jdbcTemplate.update(sql,pictureData.getId(), pictureData.getDatasetId(), pictureData.getName(), pictureData.getFilePath());


        return pictureData;
    }
}
